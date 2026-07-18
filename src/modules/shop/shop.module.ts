import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { OrderEntity } from './entities/order.entity';
import { VoteBalanceEntity } from '../votes/entities/vote-balance.entity';
import { BridgeModule } from '../bridge/bridge.module';
import { CurrencyModule } from '../currency/currency.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, VoteBalanceEntity]),
    ConfigModule,
    HttpModule,
    JwtModule.register({}),
    BridgeModule,
    CurrencyModule,
    SettingsModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
