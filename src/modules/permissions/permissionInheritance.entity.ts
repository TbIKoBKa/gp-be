import { Column, Entity, Unique } from 'typeorm';

import { IPermissionInheritance } from './interfaces';
import { IdDateBaseEntity } from '../../common/entity';

@Entity({ name: 'permissions_inheritance' })
@Unique(['child'])
export class PermissionInheritanceEntity
  extends IdDateBaseEntity
  implements IPermissionInheritance
{
  @Column({ type: 'varchar' })
  public child: string;

  @Column({ type: 'varchar' })
  public parent: string;

  @Column({ type: 'tinyint' })
  public type: number;

  @Column({ type: 'varchar' })
  public world: string | null;
}
