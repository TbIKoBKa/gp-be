import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not } from 'typeorm';

import { LuckSpinEntity, LuckPrizeType } from './entities/luck-spin.entity';
import { VoteBalanceEntity } from '../votes/entities/vote-balance.entity';
import { SettingsService, SettingKey } from '../settings/settings.service';

interface PrizeTier {
  weight: number;
  prizeType: LuckPrizeType;
  amount: number;
  label: string;
  key: string;
}

export interface PrizeWeights {
  nothing: number;
  gc1: number;
  gc2: number;
  gc5: number;
  gc100: number;
  gc500: number;
}

const PRIZE_DEFINITIONS: Omit<PrizeTier, 'weight'>[] = [
  { key: 'nothing', prizeType: LuckPrizeType.NOTHING, amount: 0, label: 'Пусто' },
  { key: 'gc1', prizeType: LuckPrizeType.GOCOINS, amount: 1, label: '1 GoCoins' },
  { key: 'gc2', prizeType: LuckPrizeType.GOCOINS, amount: 2, label: '2 GoCoins' },
  { key: 'gc5', prizeType: LuckPrizeType.GOCOINS, amount: 5, label: '5 GoCoins' },
  { key: 'gc100', prizeType: LuckPrizeType.GOCOINS, amount: 100, label: '100 GoCoins' },
  { key: 'gc500', prizeType: LuckPrizeType.GOCOINS, amount: 500, label: '500 GoCoins' },
];

@Injectable()
export class LuckService {
  constructor(
    @InjectRepository(LuckSpinEntity)
    private readonly luckSpinRepository: Repository<LuckSpinEntity>,
    private readonly settingsService: SettingsService,
    private readonly dataSource: DataSource,
  ) {}

  private async getPrizeTiers(): Promise<PrizeTier[]> {
    const weights = await this.settingsService.getJson<PrizeWeights>(SettingKey.LUCK_PRIZE_WEIGHTS);
    return PRIZE_DEFINITIONS.map((def) => ({
      ...def,
      weight: weights[def.key as keyof PrizeWeights] ?? 0,
    }));
  }

  async spin(nickname: string) {
    const lowerNickname = nickname.toLowerCase();
    const spinPrice = await this.settingsService.getNumber(SettingKey.LUCK_SPIN_PRICE);
    const prizeTiers = await this.getPrizeTiers();

    const result = await this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(VoteBalanceEntity, {
        where: { nickname: lowerNickname },
      });

      if (!balance || balance.balance < spinPrice) {
        throw new BadRequestException(
          `Insufficient GoCoin balance. Need ${spinPrice}, have ${balance?.balance ?? 0}`,
        );
      }

      await manager.decrement(VoteBalanceEntity, { nickname: lowerNickname }, 'balance', spinPrice);

      const prize = this.rollPrize(prizeTiers);

      if (prize.amount > 0) {
        await manager.increment(VoteBalanceEntity, { nickname: lowerNickname }, 'balance', prize.amount);
      }

      const spin = await manager.save(LuckSpinEntity, {
        nickname: lowerNickname,
        prizeType: prize.prizeType,
        prizeAmount: prize.amount,
      });

      const newBalance = await manager.findOne(VoteBalanceEntity, {
        where: { nickname: lowerNickname },
      });

      return {
        spinId: spin.id,
        prizeType: prize.prizeType,
        prizeAmount: prize.amount,
        prizeLabel: prize.label,
        stopIndex: this.generateStopIndex(prize, prizeTiers),
        newBalance: newBalance?.balance ?? 0,
      };
    });

    return result;
  }

  private rollPrize(prizeTiers: PrizeTier[]): PrizeTier {
    const totalWeight = prizeTiers.reduce((sum, t) => sum + t.weight, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;

    for (const tier of prizeTiers) {
      cumulative += tier.weight;
      if (rand < cumulative) {
        return tier;
      }
    }

    return prizeTiers[0];
  }

  private generateStopIndex(prize: PrizeTier, prizeTiers: PrizeTier[]): number {
    const tierIndex = prizeTiers.indexOf(prize);
    const stripLength = 50;
    const centerPosition = Math.floor(stripLength / 2);

    const candidatePositions: number[] = [];
    for (let i = 0; i < stripLength; i++) {
      if (this.getStripTierIndex(i, stripLength) === tierIndex) {
        candidatePositions.push(i);
      }
    }

    if (candidatePositions.length === 0) {
      return centerPosition;
    }

    return candidatePositions[Math.floor(Math.random() * candidatePositions.length)];
  }

  private getStripTierIndex(position: number, _stripLength: number): number {
    const distribution = [0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 3, 0, 0, 1, 0, 0, 0,
      0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 4, 0, 1, 0, 0, 2, 0, 0,
      0, 1, 0, 0, 0, 5, 0, 1, 0, 0];
    return distribution[position % distribution.length];
  }

  async getConfig() {
    const spinPrice = await this.settingsService.getNumber(SettingKey.LUCK_SPIN_PRICE);
    const prizeTiers = await this.getPrizeTiers();
    const totalWeight = prizeTiers.reduce((sum, t) => sum + t.weight, 0);

    const prizes = prizeTiers.map((tier) => ({
      prizeType: tier.prizeType,
      amount: tier.amount,
      label: tier.label,
      probability: ((tier.weight / totalWeight) * 100).toFixed(2) + '%',
    }));

    return { spinPrice, prizes };
  }

  async getPrizeWeights(): Promise<PrizeWeights> {
    return this.settingsService.getJson<PrizeWeights>(SettingKey.LUCK_PRIZE_WEIGHTS);
  }

  async updatePrizeWeights(weights: PrizeWeights): Promise<void> {
    await this.settingsService.setJson(SettingKey.LUCK_PRIZE_WEIGHTS, weights);
  }

  async getHistory(nickname: string, page: number = 1, limit: number = 20) {
    const lowerNickname = nickname.toLowerCase();
    const [rows, count] = await this.luckSpinRepository.findAndCount({
      where: { nickname: lowerNickname },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { rows, count, page, limit };
  }

  async getGlobalHistory(limit: number = 15) {
    return this.luckSpinRepository.find({
      where: { prizeType: Not(LuckPrizeType.NOTHING) },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
