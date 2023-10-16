import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VoteHandlerService } from './vote-handler.service';
import { VoteHandlerController } from './vote-handler.controller';
import { RconModule } from '../rcon/rcon.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from './entities/vote.entity';

@Module({
  controllers: [VoteHandlerController],
  providers: [VoteHandlerService],
  imports: [ConfigModule, RconModule, TypeOrmModule.forFeature([VoteEntity])],
})
export class VoteHandlerModule {}
