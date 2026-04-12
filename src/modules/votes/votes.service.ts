import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto';
import { McServeraVoteHandlerDto } from './dto/mcservera-vote-handler.dto';
import { VoteEntity, VoteSource } from './entities/vote.entity';
import { VoteBalanceEntity } from './entities/vote-balance.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteEntityRepository: Repository<VoteEntity>,
    @InjectRepository(VoteBalanceEntity)
    private readonly voteBalanceRepository: Repository<VoteBalanceEntity>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async getVotes(where: FindOptionsWhere<VoteEntity>) {
    return this.voteEntityRepository.findAndCount({ where });
  }

  async getVoteByNickname(nickname: string) {
    return this.voteEntityRepository.findAndCount({
      where: { nickname: nickname.toLowerCase() },
    });
  }

  async getBalance(nickname: string) {
    const balance = await this.voteBalanceRepository.findOne({
      where: { nickname: nickname.toLowerCase() },
    });

    return balance ?? { nickname: nickname.toLowerCase(), balance: 0, totalVotes: 0 };
  }

  async getGlobalStats() {
    const totalVotes = await this.voteEntityRepository.count();

    const totalPlayers = await this.voteBalanceRepository.count();

    const topPlayers = await this.voteBalanceRepository.find({
      order: { totalVotes: 'DESC' },
      take: 20,
    });

    return { totalVotes, totalPlayers, topPlayers };
  }

  async getPlayerStats(nickname: string, from?: string, to?: string) {
    const lowerNickname = nickname.toLowerCase();

    const balance = await this.voteBalanceRepository.findOne({
      where: { nickname: lowerNickname },
    });

    const bySourceQuery = this.voteEntityRepository
      .createQueryBuilder('vote')
      .select('vote.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('vote.nickname = :nickname', { nickname: lowerNickname })
      .groupBy('vote.source');

    if (from) {
      bySourceQuery.andWhere('vote.createdAt >= :from', { from });
    }
    if (to) {
      bySourceQuery.andWhere('vote.createdAt <= :to', { to });
    }

    const bySourceRaw: { source: string; count: string }[] = await bySourceQuery.getRawMany();

    const bySource: Record<string, number> = {};
    for (const row of bySourceRaw) {
      bySource[row.source ?? 'unknown'] = parseInt(row.count, 10);
    }

    const byDayQuery = this.voteEntityRepository
      .createQueryBuilder('vote')
      .select('DATE(vote.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('vote.nickname = :nickname', { nickname: lowerNickname })
      .groupBy('DATE(vote.created_at)')
      .orderBy('date', 'DESC')
      .limit(30);

    if (from) {
      byDayQuery.andWhere('vote.created_at >= :from', { from });
    }
    if (to) {
      byDayQuery.andWhere('vote.created_at <= :to', { to });
    }

    const byDayRaw: { date: string; count: string }[] = await byDayQuery.getRawMany();

    const byDay = byDayRaw.map((row) => ({
      date: row.date,
      count: parseInt(row.count, 10),
    }));

    return {
      nickname: lowerNickname,
      balance: balance?.balance ?? 0,
      totalVotes: balance?.totalVotes ?? 0,
      bySource,
      byDay,
    };
  }

  // --- Vote handlers ---

  async hotMcHandler({ nick, sign, time }: HotmcVoteHandlerDto) {
    const secret = this.configService.get('HOTMC_SECRET_KEY');

    const sha1 = crypto.createHash('sha1').update(nick + time + secret).digest('hex');

    if (sign !== sha1) {
      throw new UnauthorizedException();
    }

    await this.handleVote(nick, VoteSource.HOTMC);

    return 'ok';
  }

  async mineservHandler({ project, signature, timestamp, username }: MineservVoteHandlerDto) {
    const secret = this.configService.get('MINESERV_SECRET_KEY');
    const toHash = `${project}.${secret}.${timestamp}.${username}`;
    const selfSign = crypto.createHash('sha256').update(toHash).digest('hex');

    if (selfSign !== signature) {
      throw new UnauthorizedException();
    }

    await this.handleVote(username, VoteSource.MINESERV);

    return 'done';
  }

  async mcServeraHandler({ id, name, sign, sandbox }: McServeraVoteHandlerDto) {
    const secret = this.configService.get('MCSERVERA_SECRET_KEY');

    if (sandbox !== '1') {
      const calculatedSign = crypto
        .createHash('sha1')
        .update(name + secret + id)
        .digest('hex');

      if (calculatedSign !== sign) {
        throw new UnauthorizedException();
      }

      if (name) {
        await this.handleVote(name, VoteSource.MC_SERVERA);
      }
    }

    return { status: 1, message: 'OK', queryIndex: 0 };
  }

  // --- Core vote logic ---

  async handleVote(nickname: string, source: VoteSource) {
    const lowerNickname = nickname.toLowerCase();

    await this.dataSource.transaction(async (manager) => {
      await manager.save(VoteEntity, {
        nickname: lowerNickname,
        source,
      });

      const existing = await manager.findOne(VoteBalanceEntity, {
        where: { nickname: lowerNickname },
      });

      if (existing) {
        await manager.increment(VoteBalanceEntity, { nickname: lowerNickname }, 'balance', 1);
        await manager.increment(VoteBalanceEntity, { nickname: lowerNickname }, 'totalVotes', 1);
      } else {
        await manager.save(VoteBalanceEntity, {
          nickname: lowerNickname,
          balance: 1,
          totalVotes: 1,
        });
      }
    });
  }
}
