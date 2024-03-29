import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionEntityEntity } from './permissionEntity.entity';
import { IPermissionEntity } from './interfaces';
import { PermissionsType } from './types';

const totalPermissions: string[] = Object.values(PermissionsType);

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntityEntity)
    private readonly permissionEntityEntityRepository: Repository<PermissionEntityEntity>
  ) {}

  public async search(): Promise<IPermissionEntity[]> {
    const queryBuilder =
      this.permissionEntityEntityRepository.createQueryBuilder(
        'permissions_entity'
      );

    queryBuilder.select();

    queryBuilder.orderBy('price_forever', 'ASC');

    const permissions = await queryBuilder.getMany();

    const filteredPermissions = permissions.filter((item) =>
      totalPermissions.includes(item.name)
    );

    return await Promise.all(filteredPermissions);
  }
}
