import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { PartnersService } from './partners.service';
import { PartnerStatsDto } from './dto/partner-stats.dto';

/** Публичная статистика рекламной кампании по секретной ссылке. Только агрегаты, без ников и IP. */
@ApiTags('partners')
@Controller('/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('/:token/stats')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @UseInterceptors(CacheInterceptor)
  public getStats(@Param('token') token: string, @Query() dto: PartnerStatsDto) {
    return this.partnersService.getStats(token, dto);
  }
}
