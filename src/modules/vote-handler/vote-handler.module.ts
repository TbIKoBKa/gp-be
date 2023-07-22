import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { VoteHandlerService } from './vote-handler.service';
import { VoteHandlerController } from './vote-handler.controller';
import { RconModule } from '../rcon/rcon.module';

@Module({
  controllers: [VoteHandlerController],
  providers: [VoteHandlerService],
  imports: [ConfigModule, RconModule],
})
export class VoteHandlerModule {}
