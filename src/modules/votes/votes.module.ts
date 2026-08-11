import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { VotesService } from './votes.service';
import { TopMinecrafterService } from './top-minecrafter.service';
import { VotesController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { VoteBalanceEntity } from './entities/vote-balance.entity';

@Module({
  controllers: [VotesController],
  providers: [VotesService, TopMinecrafterService],
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([VoteEntity, VoteBalanceEntity]),
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
