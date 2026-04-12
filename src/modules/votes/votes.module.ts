import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VotesService } from './votes.service';
import { VotesController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';
import { VoteBalanceEntity } from './entities/vote-balance.entity';

@Module({
  controllers: [VotesController],
  providers: [VotesService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([VoteEntity, VoteBalanceEntity]),
  ],
})
export class VotesModule {}
