import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

import { IPermission } from './interfaces';
import { IdDateBaseEntity } from '../../common/entity';
import { PermissionInheritanceEntity } from './permissionInheritance.entity';
import { PlayerEntity } from '../player/player.entity';

@Entity({ name: 'permissions' })
export class PermissionEntity extends IdDateBaseEntity implements IPermission {
  @Column({ type: 'varchar' })
  public name: string;

  @Column({ type: 'tinyint' })
  public type: number;

  @Column({ type: 'mediumtext' })
  public permission: string;

  @Column({ type: 'varchar' })
  public world: string;

  @Column({ type: 'mediumtext' })
  public value: string;

  @OneToOne(() => PermissionInheritanceEntity)
  public permissionInheritance: PermissionInheritanceEntity;

  @OneToMany(() => PlayerEntity, (playerEntity) => playerEntity.permission)
  public players: Array<PlayerEntity>;
}
