import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { ServerStatusLogEntity } from './entities/server-status-log.entity';
import { ServerStatusHourlyEntity } from './entities/server-status-hourly.entity';

const SERVER_ADDRESS = 'play.go-play-gg.com';
const MCSRVSTAT_URL = `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`;

interface McsrvstatResponse {
  online: boolean;
  players?: { online: number; max: number };
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(ServerStatusLogEntity)
    private readonly logRepository: Repository<ServerStatusLogEntity>,
    @InjectRepository(ServerStatusHourlyEntity)
    private readonly hourlyRepository: Repository<ServerStatusHourlyEntity>,
    private readonly httpService: HttpService,
  ) {}

  @Cron('0 */3 * * * *')
  async pollServerStatus() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<McsrvstatResponse>(MCSRVSTAT_URL, {
          headers: { 'User-Agent': 'GoPlay-Monitor/1.0' },
          timeout: 10_000,
        }),
      );

      await this.logRepository.save({
        online: data.online,
        playersOnline: data.players?.online ?? 0,
        playersMax: data.players?.max ?? 0,
      });
    } catch (error) {
      this.logger.error('Failed to poll server status', (error as Error).message);

      await this.logRepository.save({
        online: false,
        playersOnline: 0,
        playersMax: 0,
      });
    }
  }

  @Cron('0 5 * * * *')
  async aggregateHourly() {
    const now = new Date();
    const hourStart = new Date(now);
    hourStart.setMinutes(0, 0, 0);
    hourStart.setHours(hourStart.getHours() - 1);

    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const logs = await this.logRepository
      .createQueryBuilder('log')
      .where('log.created_at >= :start AND log.created_at < :end', {
        start: hourStart,
        end: hourEnd,
      })
      .getMany();

    if (logs.length === 0) return;

    const onlineCount = logs.filter((l) => l.online).length;
    const players = logs.map((l) => l.playersOnline);

    const avgPlayers = players.reduce((a, b) => a + b, 0) / players.length;
    const minPlayers = Math.min(...players);
    const maxPlayers = Math.max(...players);
    const uptimePercent = (onlineCount / logs.length) * 100;

    const existing = await this.hourlyRepository.findOne({ where: { hour: hourStart } });

    if (existing) {
      await this.hourlyRepository.update(existing.id, {
        avgPlayers,
        minPlayers,
        maxPlayers,
        uptimePercent,
        checkCount: logs.length,
      });
    } else {
      await this.hourlyRepository.save({
        hour: hourStart,
        avgPlayers,
        minPlayers,
        maxPlayers,
        uptimePercent,
        checkCount: logs.length,
      });
    }

    this.logger.log(`Aggregated ${logs.length} checks for hour ${hourStart.toISOString()}`);
  }

  @Cron('0 0 3 * * *')
  async cleanup() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 31);

    const result = await this.logRepository.delete({
      createdAt: LessThan(cutoff),
    });

    if (result.affected && result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} old status log entries`);
    }
  }

  async getLatestStatus() {
    const [latest, peakOnline] = await Promise.all([
      this.logRepository.findOne({
        where: {},
        order: { createdAt: 'DESC' },
      }),
      this.getPeakOnline(),
    ]);

    if (!latest) {
      return { online: false, playersOnline: 0, playersMax: 0, checkedAt: null, peakOnline };
    }

    return {
      online: latest.online,
      playersOnline: latest.playersOnline,
      playersMax: latest.playersMax,
      checkedAt: latest.createdAt,
      peakOnline,
    };
  }

  async getPeakOnline(): Promise<number> {
    const hourlyResult = await this.hourlyRepository
      .createQueryBuilder('h')
      .select('MAX(h.max_players)', 'peak')
      .getRawOne();

    const logResult = await this.logRepository
      .createQueryBuilder('log')
      .select('MAX(log.players_online)', 'peak')
      .getRawOne();

    const hourlyPeak = hourlyResult?.peak ?? 0;
    const logPeak = logResult?.peak ?? 0;

    return Math.max(hourlyPeak, logPeak);
  }

  async getOnlineHistory(period: '1d' | '7d' | '30d') {
    if (period === '1d' || period === '7d') {
      return this.getRawHistory(1);
    }

    return this.getHourlyHistory(30);
  }

  private async getRawHistory(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.logRepository
      .createQueryBuilder('log')
      .where('log.created_at >= :since', { since })
      .orderBy('log.created_at', 'ASC')
      .getMany();

    return {
      period: '1d' as const,
      data: logs.map((l) => ({
        timestamp: l.createdAt,
        playersOnline: l.playersOnline,
        online: l.online,
      })),
    };
  }

  private async getHourlyHistory(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.hourlyRepository
      .createQueryBuilder('h')
      .where('h.hour >= :since', { since })
      .orderBy('h.hour', 'ASC')
      .getMany();

    return {
      period: (days === 7 ? '7d' : '30d') as '7d' | '30d',
      data: rows.map((r) => ({
        timestamp: r.hour,
        playersOnline: Math.round(r.avgPlayers),
        online: r.uptimePercent > 0,
      })),
    };
  }
}
