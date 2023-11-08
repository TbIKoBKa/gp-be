import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RconService } from '../rcon/rcon.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GoCoinEntity } from './entities/go-coin.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class GoCoinsService {
  constructor(
    @InjectRepository(GoCoinEntity)
    private readonly goCoinsRepository: Repository<GoCoinEntity>,
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  async getGoCoins(where: FindOptionsWhere<GoCoinEntity>) {
    return this.goCoinsRepository.findAndCount({
      where,
    });
  }

  async getGoCoinsByNickname(nickname: string) {
    return this.goCoinsRepository.findOne({
      where: {
        nick: nickname.toLowerCase(),
      },
    });
  }

  async updateBalance(nickname: string, delta: number) {
    const goCoins = await this.goCoinsRepository.findOne({
      where: {
        nick: nickname.toLowerCase(),
      },
    });

    if (!goCoins) {
      return this.goCoinsRepository.save({
        nick: nickname.toLowerCase(),
        balance: this.roundBalance(0, delta),
      });
    } else {
      return this.goCoinsRepository.update(
        {
          nick: nickname.toLowerCase(),
        },
        {
          balance: this.roundBalance(goCoins.balance, delta),
        }
      );
    }
  }

  private roundBalance(balance: number, delta: number) {
    const newBalance = balance + delta;

    return newBalance < 0 ? 0 : newBalance;
  }
}
