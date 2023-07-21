import { ConfigModule } from '@nestjs/config';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './orders.entity';
import { PermissionInheritanceEntity } from '../permissions/permissionInheritance.entity';
import { PermissionEntity } from '../permissions/permissions.entity';
import { RconModule } from '../rcon/rcon.module';
import { PermissionEntityEntity } from '../permissions/permissionEntity.entity';
import { ProductEntity } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      PermissionEntity,
      PermissionEntityEntity,
      PermissionInheritanceEntity,
      ProductEntity,
    ]),
    ConfigModule,
    RconModule,
  ],
  providers: [Logger, OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
