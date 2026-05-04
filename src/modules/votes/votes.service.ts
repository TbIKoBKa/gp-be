import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto';
import { TmonitoringVoteHandlerDto } from './dto/tmonitoring-vote-handler.dto';
import { VoteEntity, VoteSource } from './entities/vote.entity';
import { VoteBalanceEntity } from './entities/vote-balance.entity';

@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteEntityRepository: Repository<VoteEntity>,
    @InjectRepository(VoteBalanceEntity)
    private readonly voteBalanceRepository: Repository<VoteBalanceEntity>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
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

  async getGlobalStats(days = 30) {
    const totalVotes = await this.voteEntityRepository.count();

    const totalPlayers = await this.voteBalanceRepository.count();

    const topPlayers = await this.voteBalanceRepository.find({
      order: { totalVotes: 'DESC' },
      take: 20,
    });

    const byDayRaw = await this.voteEntityRepository
      .createQueryBuilder('vote')
      .select('DATE(vote.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('vote.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)', { days })
      .groupBy('DATE(vote.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const byDay = byDayRaw.map((r: { date: string; count: string }) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));

    const topForPeriodRaw = await this.voteEntityRepository
      .createQueryBuilder('vote')
      .select('vote.nickname', 'nickname')
      .addSelect('COUNT(*)', 'votes')
      .where('vote.created_at >= DATE_SUB(NOW(), INTERVAL :days DAY)', { days })
      .groupBy('vote.nickname')
      .orderBy('votes', 'DESC')
      .getRawMany();

    const topForPeriod = topForPeriodRaw.map((r: { nickname: string; votes: string }) => ({
      nickname: r.nickname,
      votes: parseInt(r.votes, 10),
    }));

    return { totalVotes, totalPlayers, topPlayers, byDay, topForPeriod };
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

  async tmonitoringHandler({ hash, id }: TmonitoringVoteHandlerDto) {
    this.logger.log(`TMonitoring callback received: hash=${hash}, id=${id}`);

    if (!hash || hash.length !== 32) {
      this.logger.warn(`TMonitoring invalid hash length: ${hash?.length}`);
      throw new UnauthorizedException('Invalid hash');
    }

    let rawData: string;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<string>(
          `https://tmonitoring.com/api/check/${hash}?id=${id}`,
          { responseType: 'text' },
        ),
      );
      rawData = typeof data === 'string' ? data : JSON.stringify(data);
    } catch (err) {
      this.logger.error(`TMonitoring API check failed: ${err}`);
      throw new UnauthorizedException('API check failed');
    }

    this.logger.log(`TMonitoring API response: ${rawData}`);

    const parsed = this.parseTMonitoringResponse(rawData);
    this.logger.log(`TMonitoring parsed: ${JSON.stringify(parsed)}`);

    if (!parsed.hash || parsed.hash.length !== 32 || parsed.hash !== hash) {
      this.logger.warn(`TMonitoring hash mismatch: expected=${hash}, got=${parsed.hash}`);
      throw new UnauthorizedException('Hash mismatch');
    }

    if (!parsed.username) {
      this.logger.warn('TMonitoring username not found in response');
      throw new UnauthorizedException('Username not found');
    }

    await this.handleVote(parsed.username, VoteSource.TMONITORING);
    this.logger.log(`TMonitoring vote recorded for ${parsed.username}`);

    return 'ok';
  }

  private parseTMonitoringResponse(raw: string): Record<string, string> {
    try {
      const json = JSON.parse(raw);
      if (json && typeof json === 'object') {
        return json;
      }
    } catch {
      // Not JSON, try PHP serialized format
    }

    const result: Record<string, string> = {};
    const regex = /s:\d+:"([^"]*?)";s:\d+:"([^"]*?)";/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(raw)) !== null) {
      result[match[1]] = match[2];
    }

    if (Object.keys(result).length === 0) {
      this.logger.warn(`TMonitoring could not parse response: ${raw}`);
    }

    return result;
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
