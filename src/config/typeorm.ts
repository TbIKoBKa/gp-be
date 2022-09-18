import { Injectable } from "@nestjs/common";
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { PlayerEntity } from "../modules/player/player.entity";
import { ContactEntity } from "../modules/contacts/contacts.entity";
import { PermissionEntity } from "../modules/permissions/permission.entity";
import { PermissionInheritanceEntity } from "../modules/permissions/permissionInheritance.entity";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      name:     "default",
      type:     "mysql",
      host:     process.env.MYSQL_HOST,
      port:     process.env.MYSQL_PORT,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_NAME,
      entities: [ PlayerEntity, ContactEntity, PermissionEntity, PermissionInheritanceEntity ],
    };
  }
}
