import { Logger, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { LimboAuthPlayer } from '../auth/entities/limboauth-player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LimboAuthPlayer], 'minecraft'),
    ConfigModule,
    CacheModule.register(),
  ],
  providers: [Logger, PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService],
})
export class PlayerModule {}
