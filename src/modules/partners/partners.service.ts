import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PartnerCampaignEntity } from './entities/partner-campaign.entity';
import { RegistrationSourceEntity } from './entities/registration-source.entity';
import { PartnerStatsDto } from './dto/partner-stats.dto';
import { aggregateRegistrations, Aggregated, mskDate, mskDayEnd, mskDayStart, PLAYED_THRESHOLD_SEC } from './partner-stats';

const TOKEN_RE = /^[a-f0-9]{32,64}$/;
/** Потолок периода: дальше график нечитаем, а запрос растёт без пользы. */
const MAX_PERIOD_DAYS = 366;

export interface PartnerStatsResponse extends Aggregated {
  campaign: {
    name: string;
    hosts: string[];
    startsAt: string;
    endsAt: string | null;
  };
  period: { from: string; to: string };
  playedThresholdMinutes: number;
  generatedAt: string;
}

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerCampaignEntity)
    private readonly campaigns: Repository<PartnerCampaignEntity>,
    @InjectRepository(RegistrationSourceEntity, 'minecraft')
    private readonly sources: Repository<RegistrationSourceEntity>,
  ) {}

  async getStats(token: string, dto: PartnerStatsDto): Promise<PartnerStatsResponse> {
    // Неизвестный, кривой и выключенный токен отвечают одинаково: по ответу нельзя понять,
    // существует ли кампания.
    const campaign = TOKEN_RE.test(token) ? await this.campaigns.findOne({ where: { token, active: true } }) : null;
    if (!campaign) throw new NotFoundException('Campaign not found');

    const hosts = campaign.hosts.map((h) => h.toLowerCase().trim()).filter(Boolean);
    const now = Date.now();
    const campaignStart = campaign.startsAt.getTime();
    const campaignEnd = campaign.endsAt ? campaign.endsAt.getTime() : now;

    // Период запроса обрезается рамками кампании: регистрации до старта ей не засчитываются.
    const askedFrom = dto.from ? mskDayStart(dto.from) : null;
    const askedTo = dto.to ? mskDayEnd(dto.to) : null;
    let from = Math.max(campaignStart, askedFrom ?? campaignStart);
    const to = Math.min(campaignEnd, now, askedTo ?? now);
    from = Math.max(from, to - MAX_PERIOD_DAYS * 24 * 60 * 60 * 1000);

    const rows =
      hosts.length === 0 || from > to
        ? []
        : await this.sources
            .createQueryBuilder('s')
            .select(['s.regDate', 's.playtimeSec', 's.returnAt', 's.ip', 's.bedrock'])
            .where('s.host IN (:...hosts)', { hosts })
            .andWhere('s.regDate BETWEEN :from AND :to', { from, to })
            .getMany();

    const aggregated = aggregateRegistrations(
      rows.map((r) => ({
        regDate: Number(r.regDate),
        playtimeSec: Number(r.playtimeSec),
        returnAt: r.returnAt === null ? null : Number(r.returnAt),
        ip: r.ip,
        bedrock: Number(r.bedrock) === 1,
      })),
      from,
      Math.max(from, to),
    );

    return {
      campaign: {
        name: campaign.name,
        hosts,
        startsAt: campaign.startsAt.toISOString(),
        endsAt: campaign.endsAt ? campaign.endsAt.toISOString() : null,
      },
      period: { from: mskDate(from), to: mskDate(Math.max(from, to)) },
      playedThresholdMinutes: PLAYED_THRESHOLD_SEC / 60,
      generatedAt: new Date(now).toISOString(),
      ...aggregated,
    };
  }
}
