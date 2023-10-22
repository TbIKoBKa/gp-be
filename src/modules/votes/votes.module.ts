import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VotesService } from './votes.service';
import { VotesController } from './vote.controller';
import { RconModule } from '../rcon/rcon.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { GoCoinsModule } from '../go-coins/go-coins.module';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
  imports: [
    ConfigModule,
    NestjsFormDataModule,
    RconModule,
    GoCoinsModule,
    TypeOrmModule.forFeature([VoteEntity]),
  ],
})
export class VotesModule {}
