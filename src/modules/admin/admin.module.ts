import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { OrderEntity } from '../shop/entities/order.entity';
import { VoteEntity } from '../votes/entities/vote.entity';
import { VoteBalanceEntity } from '../votes/entities/vote-balance.entity';
import { LimboAuthPlayer } from '../auth/entities/limboauth-player.entity';
import { BridgeModule } from '../bridge/bridge.module';

import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, VoteEntity, VoteBalanceEntity]),
    TypeOrmModule.forFeature([LimboAuthPlayer], 'minecraft'),
    JwtModule.register({}),
    ConfigModule,
    BridgeModule,
  ],
  controllers: [AdminController, AdminAuthController],
  providers: [AdminService],
})
export class AdminModule {}
