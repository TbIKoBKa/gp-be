import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { MonitoringService } from './monitoring.service';

@ApiTags('monitoring')
@Controller('monitoring')
@SkipThrottle()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('status')
  getStatus() {
    return this.monitoringService.getLatestStatus();
  }

  @Get('history')
  getHistory(@Query('period') period?: string) {
    const validPeriods = ['1d', '7d', '30d'] as const;
    const p = validPeriods.includes(period as any) ? (period as '1d' | '7d' | '30d') : '1d';
    return this.monitoringService.getOnlineHistory(p);
  }
}
