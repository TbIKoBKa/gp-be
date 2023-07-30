import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [ConfigModule],
})
export class PaymentsModule {}
