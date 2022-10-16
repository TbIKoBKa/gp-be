import { Column, Entity } from "typeorm";

import { IPermissionEntity } from "./interfaces";
import { IdDateBaseEntity } from "../../common/entity";

@Entity({ name: 'permissions_entity' })
export class PermissionEntityEntity extends IdDateBaseEntity implements IPermissionEntity {
  @Column({ type: 'varchar' })
  public name: string;

  @Column({ type: 'varchar' })
  public image: string;

  @Column({ type: 'smallint' })
  public price_forever: number;

  @Column({ type: 'smallint' })
  public price_month: number;
}
