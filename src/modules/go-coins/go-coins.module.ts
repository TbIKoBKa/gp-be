import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GoCoinsService } from './go-coins.service';
import { GoCoinsController } from './go-coins.controller';
import { RconModule } from '../rcon/rcon.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoCoinEntity } from './entities/go-coin.entity';
import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  controllers: [GoCoinsController],
  providers: [GoCoinsService],
  imports: [
    ConfigModule,
    NestjsFormDataModule,
    RconModule,
    TypeOrmModule.forFeature([GoCoinEntity]),
  ],
  exports: [GoCoinsService],
})
export class GoCoinsModule {}
