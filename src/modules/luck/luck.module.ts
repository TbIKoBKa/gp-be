import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { LuckSpinEntity } from './entities/luck-spin.entity';
import { LuckService } from './luck.service';
import { LuckController } from './luck.controller';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LuckSpinEntity]),
    ConfigModule,
    JwtModule.register({}),
    SettingsModule,
  ],
  controllers: [LuckController],
  providers: [LuckService],
})
export class LuckModule {}
