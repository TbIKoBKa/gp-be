import { ConfigModule } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './orders.entity';
import { PermissionInheritanceEntity } from '../permissions/permissionInheritance.entity';
import { PermissionEntity } from '../permissions/permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      PermissionEntity,
      PermissionInheritanceEntity,
    ]),
    ConfigModule,
  ],
  providers: [Logger, OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
