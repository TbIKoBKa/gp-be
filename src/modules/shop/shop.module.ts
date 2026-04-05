import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { OrderEntity } from './entities/order.entity';
import { BridgeModule } from '../bridge/bridge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    ConfigModule,
    BridgeModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
