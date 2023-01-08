import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from '@nestjs/axios';

import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { PermissionEntityEntity } from "./permissionEntity.entity";
import { PermissionInheritanceEntity } from "./permissionInheritance.entity";
import { PermissionEntity } from "./permissions.entity";
import { OrderEntity } from "../orders/orders.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ OrderEntity, PermissionEntityEntity, PermissionInheritanceEntity, PermissionEntity ]),
    ConfigModule,
    HttpModule,
  ],
  providers:   [ Logger, PermissionsService ],
  controllers: [ PermissionsController ],
  exports:     [ PermissionsService ],
})
export class PermissionsModule {}
