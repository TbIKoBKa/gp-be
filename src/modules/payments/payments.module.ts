import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { GoCoinsModule } from '../go-coins/go-coins.module';
import { RconModule } from '../rcon/rcon.module';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [ConfigModule, GoCoinsModule, RconModule],
})
export class PaymentsModule {}
