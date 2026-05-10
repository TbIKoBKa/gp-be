import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MigrationService } from './migration.service';

@Module({
  imports: [ConfigModule],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class DatabaseModule {}
