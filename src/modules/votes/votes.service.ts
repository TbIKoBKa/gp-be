import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto';
import { VoteEntity, VoteSource } from './entities/vote.entity';
import { VoteBalanceEntity } from './entities/vote-balance.entity';

/** Ник как в LimboAuth: только он может прийти в колбэке честного мониторинга. */
const NICK_RE = /^[A-Za-z0-9_]{3,16}$/;
/** Голос старше суток не принимаем: так повтор старого колбэка ничего не даёт. */
const MAX_VOTE_AGE_SEC = 24 * 60 * 60;
/** Часы мониторинга могут спешить. */
const MAX_CLOCK_SKEW_SEC = 5 * 60;

/** Сравнение подписей за постоянное время. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Время голоса в секундах, если оно свежее; иначе null.
 *
 * Мониторинги шлют UNIX-время; на всякий случай принимаем и миллисекунды. Строгий формат
 * заодно закрывает подделку у HotMC: подпись там считается от склейки ник+время, и без
 * проверки времени «Steve» + «1727…» и «Steve1» + «727…» дают одну и ту же подпись.
 */
function freshVoteTime(raw: unknown): number | null {
  const str = String(raw ?? '').trim();
  if (!/^\d{9,13}$/.test(str)) return null;
  const seconds = str.length > 11 ? Math.floor(Number(str) / 1000) : Number(str);
  const now = Math.floor(Date.now() / 1000);
  if (seconds > now + MAX_CLOCK_SKEW_SEC || now - seconds > MAX_VOTE_AGE_SEC) return null;
  return seconds;
}

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
    const nickStr = String(nick ?? '');
    const timeStr = String(time ?? '');

    const sha1 = crypto.createHash('sha1').update(nickStr + timeStr + secret).digest('hex');

    if (!safeEqual(String(sign ?? '').toLowerCase(), sha1)) {
      throw new UnauthorizedException();
    }

    const voteTime = freshVoteTime(timeStr);
    if (voteTime === null || !NICK_RE.test(nickStr)) {
      this.logger.warn(`hotmc vote refused: nick="${nickStr}" time="${timeStr}" (stale or malformed)`);
      throw new BadRequestException('stale or malformed vote');
    }

    // Повтор того же колбэка ничего не начисляет, но отвечаем «ok», чтобы мониторинг не слал его снова.
    await this.handleVote(nickStr, VoteSource.HOTMC, { externalId: `${nickStr.toLowerCase()}:${voteTime}` });

    return 'ok';
  }

  async mineservHandler({ project, signature, timestamp, username }: MineservVoteHandlerDto) {
    const secret = this.configService.get('MINESERV_SECRET_KEY');
    const userStr = String(username ?? '');
    const timeStr = String(timestamp ?? '');
    const toHash = `${project}.${secret}.${timeStr}.${userStr}`;
    const selfSign = crypto.createHash('sha256').update(toHash).digest('hex');

    if (!safeEqual(String(signature ?? '').toLowerCase(), selfSign)) {
      throw new UnauthorizedException();
    }

    const voteTime = freshVoteTime(timeStr);
    if (voteTime === null || !NICK_RE.test(userStr)) {
      this.logger.warn(`mineserv vote refused: username="${userStr}" timestamp="${timeStr}" (stale or malformed)`);
      throw new BadRequestException('stale or malformed vote');
    }

    await this.handleVote(userStr, VoteSource.MINESERV, { externalId: `${userStr.toLowerCase()}:${voteTime}` });

    return 'done';
  }

  // --- Core vote logic ---

  /** `externalId` makes the call idempotent. Returns true when the vote was actually credited. */
  async handleVote(
    nickname: string,
    source: VoteSource,
    options?: { createdAt?: Date; externalId?: string },
  ): Promise<boolean> {
    const lowerNickname = nickname.toLowerCase();
    const createdAt = options?.createdAt ?? new Date();
    const externalId = options?.externalId;

    return this.dataSource.transaction(async (manager) => {
      if (externalId) {
        const insertResult = await manager
          .createQueryBuilder()
          .insert()
          .into(VoteEntity)
          .values({ nickname: lowerNickname, source, externalId, createdAt })
          .orIgnore()
          .updateEntity(false)
          .execute();

        // INSERT IGNORE: affectedRows is 1 on a real insert and 0 on a duplicate key.
        // insertId is unusable here — it stays 0 on a skipped row.
        const affectedRows =
          (insertResult.raw as { affectedRows?: number } | undefined)?.affectedRows ?? 0;

        if (affectedRows === 0) {
          return false;
        }
      } else {
        await manager.save(VoteEntity, {
          nickname: lowerNickname,
          source,
          createdAt,
        });
      }

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

      return true;
    });
  }
}
