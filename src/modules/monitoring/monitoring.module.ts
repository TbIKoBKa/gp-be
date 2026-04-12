import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { ServerStatusLogEntity } from './entities/server-status-log.entity';
import { ServerStatusHourlyEntity } from './entities/server-status-hourly.entity';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ServerStatusLogEntity, ServerStatusHourlyEntity]),
  ],
})
export class MonitoringModule {}
