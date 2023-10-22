import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { PlayerEntity } from '../modules/player/player.entity';
import { ContactEntity } from '../modules/contacts/contacts.entity';
import { PermissionEntity } from '../modules/permissions/permissions.entity';
import { PermissionInheritanceEntity } from '../modules/permissions/permissionInheritance.entity';
import { PermissionEntityEntity } from '../modules/permissions/permissionEntity.entity';
import { OrderEntity } from '../modules/orders/orders.entity';
import { ProductEntity } from '../modules/products/entities/product.entity';
import { AuthPlayerEntity } from '../modules/auth/entities/player.entity';
import { VoteEntity } from '../modules/votes/entities/vote.entity';
import { GoCoinEntity } from '../modules/go-coins/entities/go-coin.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'mysql',
      host: this.configService.get('MYSQL_HOST'),
      port: this.configService.get('MYSQL_PORT'),
      username: this.configService.get('MYSQL_USER'),
      password: this.configService.get('MYSQL_PASSWORD'),
      database: this.configService.get('MYSQL_NAME'),
      entities: [
        AuthPlayerEntity,
        GoCoinEntity,
        PlayerEntity,
        ContactEntity,
        PermissionEntity,
        PermissionInheritanceEntity,
        PermissionEntityEntity,
        OrderEntity,
        ProductEntity,
        VoteEntity,
      ],
    };
  }
}
