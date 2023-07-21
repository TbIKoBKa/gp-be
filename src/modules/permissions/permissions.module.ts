import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionEntityEntity } from './permissionEntity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntityEntity])],
  providers: [Logger, PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
