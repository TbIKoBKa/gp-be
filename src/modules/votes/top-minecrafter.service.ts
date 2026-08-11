import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { VotesService } from './votes.service';
import { VoteEntity, VoteSource } from './entities/vote.entity';

const TOPMC_API = 'https://public-api.top-minecrafter.com/v1';
const TOPMC_SERVER_ID = '1003';
const UNIQUE_INDEX_NAME = 'IDX_votes_source_external_id';

const PAGE_LIMIT = 50; // provider maximum
const MAX_PAGES = 5;
const REQUEST_TIMEOUT_MS = 10_000;

// Re-read window below the newest stored vote — absorbs clock skew and page shifting.
// Dedup correctness comes from the unique index, never from this value.
const WATERMARK_SAFETY_MS = 30 * 60_000;

// First run for this source: never backfill the provider's history.
const BOOTSTRAP_WINDOW_MS = 15 * 60_000;

const FUTURE_SKEW_MS = 10 * 60_000;
const AUTH_BACKOFF_MS = 30 * 60_000;
const RATE_LIMIT_BACKOFF_MS = 5 * 60_000;
const MAX_NICKNAME_LENGTH = 32;

interface TopMcVote {
  nickname: string | null;
  voted_at: string; // ISO 8601 UTC
  streak: number;
}

interface TopMcVotesResult {
  stats: { total_votes: number; today_votes: number };
  votes: TopMcVote[]; // newest first
  pagination: { page: number; per_page: number; total_pages: number; has_more: boolean };
}

type TopMcResponse<T> =
  | { ok: true; result: T }
  // docs claim code is a number, the live API returns a slug ("INVALID_API_KEY")
  | { ok: false; error: { code: string | number; message: string } };

interface PendingVote {
  nickname: string;
  votedAt: Date;
  externalId: string;
}

@Injectable()
export class TopMinecrafterService implements OnModuleInit {
  private readonly logger = new Logger(TopMinecrafterService.name);
  private isRunning = false;
  private backoffUntil = 0;

  constructor(
    @InjectRepository(VoteEntity)
    private readonly voteRepository: Repository<VoteEntity>,
    private readonly votesService: VotesService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /** Without the unique index INSERT IGNORE degrades to a plain INSERT and every tick re-credits. */
  async onModuleInit() {
    if (!this.getApiKey()) return;

    const rows: unknown = await this.voteRepository.query(
      'SHOW INDEX FROM votes WHERE Key_name = ?',
      [UNIQUE_INDEX_NAME],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      this.backoffUntil = Number.MAX_SAFE_INTEGER;
      this.logger.error(
        `${UNIQUE_INDEX_NAME} is missing on \`votes\` — top-minecrafter polling disabled to avoid double-crediting`,
      );
    }
  }

  @Cron('30 */2 * * * *') // offset from MonitoringService's '0 */3 * * * *'
  async pollVotes() {
    const apiKey = this.getApiKey();

    if (!apiKey) return;
    if (Date.now() < this.backoffUntil) return;

    if (this.isRunning) {
      this.logger.warn('Previous top-minecrafter poll still running, skipping tick');
      return;
    }

    this.isRunning = true;

    try {
      await this.runPoll(apiKey);
    } catch (error) {
      this.logger.error('top-minecrafter poll aborted', (error as Error).message);
    } finally {
      this.isRunning = false;
    }
  }

  private async runPoll(apiKey: string) {
    const watermark = await this.getWatermark();
    const cutoff = new Date(watermark.getTime() - WATERMARK_SAFETY_MS);

    const collected = await this.fetchVotesUntil(apiKey, cutoff);
    const pending = this.normalise(collected, cutoff);

    if (pending.length === 0) return;

    const known = await this.findKnownExternalIds(pending.map((vote) => vote.externalId));

    // oldest first: a crash mid-loop leaves a contiguous watermark
    const fresh = pending
      .filter((vote) => !known.has(vote.externalId))
      .sort((a, b) => a.votedAt.getTime() - b.votedAt.getTime());

    let credited = 0;

    for (const vote of fresh) {
      try {
        const inserted = await this.votesService.handleVote(
          vote.nickname,
          VoteSource.TOP_MINECRAFTER,
          { createdAt: vote.votedAt, externalId: vote.externalId },
        );

        if (inserted) credited += 1;
      } catch (error) {
        this.logger.error(
          `top-minecrafter: failed to credit ${vote.externalId}`,
          (error as Error).message,
        );
      }
    }

    if (credited > 0) {
      this.logger.log(
        `top-minecrafter: credited ${credited} new vote(s) out of ${collected.length} read`,
      );
    }
  }

  /**
   * Fetches every page down to the cutoff BEFORE anything is written. Votes come
   * newest-first and the watermark is MAX(created_at), so writing page 1 right away would
   * raise the watermark above pages 2+ and a failure there would lose those votes for good.
   */
  private async fetchVotesUntil(apiKey: string, cutoff: Date): Promise<TopMcVote[]> {
    const collected: TopMcVote[] = [];
    let page = 1;

    for (;;) {
      const result = await this.fetchPage(apiKey, page);
      collected.push(...result.votes);

      const oldest = result.votes[result.votes.length - 1];
      const oldestDate = oldest ? new Date(oldest.voted_at) : null;
      const reachedCutoff =
        !oldestDate || Number.isNaN(oldestDate.getTime()) || oldestDate <= cutoff;

      if (!result.pagination.has_more || reachedCutoff) break;

      if (page >= MAX_PAGES) {
        this.logger.warn(
          `top-minecrafter: page cap of ${MAX_PAGES} reached (${collected.length} votes read); ` +
            `votes older than ${cutoff.toISOString()} were not inspected this tick`,
        );
        break;
      }

      page += 1;
    }

    return collected;
  }

  private normalise(votes: TopMcVote[], cutoff: Date): PendingVote[] {
    const now = Date.now();
    const seen = new Set<string>();
    const pending: PendingVote[] = [];

    for (const raw of votes) {
      if (!raw.nickname) continue; // anonymous vote

      const nickname = raw.nickname.trim().toLowerCase();

      if (!nickname || nickname.length > MAX_NICKNAME_LENGTH) {
        this.logger.warn(
          `top-minecrafter: skipping vote with unusable nickname "${raw.nickname}"`,
        );
        continue;
      }

      const votedAt = new Date(raw.voted_at);

      if (Number.isNaN(votedAt.getTime())) {
        this.logger.warn(
          `top-minecrafter: skipping vote with unparsable voted_at "${raw.voted_at}"`,
        );
        continue;
      }

      if (votedAt.getTime() > now + FUTURE_SKEW_MS) {
        this.logger.warn(`top-minecrafter: skipping vote dated in the future (${raw.voted_at})`);
        continue;
      }

      if (votedAt <= cutoff) continue;

      // toISOString() keeps the identity stable if the provider changes date formatting
      const externalId = `${nickname}:${votedAt.toISOString()}`;

      if (seen.has(externalId)) continue;

      seen.add(externalId);
      pending.push({ nickname, votedAt, externalId });
    }

    return pending;
  }

  private async fetchPage(apiKey: string, page: number): Promise<TopMcVotesResult> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<TopMcResponse<TopMcVotesResult>>(
          `${TOPMC_API}/servers/${TOPMC_SERVER_ID}/votes`,
          {
            params: { page, limit: PAGE_LIMIT, key: apiKey },
            headers: { 'User-Agent': 'GoPlay-Votes/1.0' },
            timeout: REQUEST_TIMEOUT_MS,
          },
        ),
      );

      if (!data?.ok) {
        const error = data?.error;
        throw new Error(`provider returned ok:false (${error?.code}: ${error?.message})`);
      }

      return data.result;
    } catch (error) {
      const err = error as { message?: string; response?: { status?: number } };
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // pause rather than kill: a rotated key recovers without a restart
        this.backoffUntil = Date.now() + AUTH_BACKOFF_MS;
        this.logger.error(
          `top-minecrafter rejected the API key (HTTP ${status}) — polling paused for 30 min`,
        );
      } else if (status === 404) {
        this.backoffUntil = Date.now() + AUTH_BACKOFF_MS;
        this.logger.error(
          `top-minecrafter server ${TOPMC_SERVER_ID} not found (HTTP 404) — polling paused for 30 min`,
        );
      } else if (status === 429) {
        this.backoffUntil = Date.now() + RATE_LIMIT_BACKOFF_MS;
        this.logger.warn('top-minecrafter rate limit hit — polling paused for 5 min');
      } else {
        this.logger.error(
          `top-minecrafter request failed (page ${page}, status ${status ?? 'n/a'}): ${err.message}`,
        );
      }

      throw error; // abort the tick; the next tick is the retry
    }
  }

  /** Newest vote already stored for this source. */
  private async getWatermark(): Promise<Date> {
    const row = await this.voteRepository
      .createQueryBuilder('vote')
      .select('MAX(vote.created_at)', 'max')
      .where('vote.source = :source', { source: VoteSource.TOP_MINECRAFTER })
      .getRawOne<{ max: Date | string | null }>();

    const now = Date.now();

    if (!row?.max) return new Date(now - BOOTSTRAP_WINDOW_MS);

    const max = new Date(row.max).getTime();

    if (Number.isNaN(max)) return new Date(now - BOOTSTRAP_WINDOW_MS);

    // clamp: a row dated in the future must not freeze polling forever
    return new Date(Math.min(max, now));
  }

  private async findKnownExternalIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();

    const rows = await this.voteRepository
      .createQueryBuilder('vote')
      .select('vote.external_id', 'externalId')
      .where('vote.source = :source', { source: VoteSource.TOP_MINECRAFTER })
      .andWhere('vote.external_id IN (:...ids)', { ids })
      .getRawMany<{ externalId: string }>();

    return new Set(rows.map((row) => row.externalId));
  }

  private getApiKey(): string | undefined {
    return this.configService.get<string>('TOP_MINECRAFTER_API_KEY') || undefined;
  }
}
