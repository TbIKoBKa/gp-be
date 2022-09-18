import { Column, Entity } from "typeorm";
import { IsString } from "class-validator";

import { IContact } from "./interfaces";
import { IdDateBaseEntity } from "../../common/entity";

@Entity({ name: 'contacts' })
export class ContactEntity extends IdDateBaseEntity implements IContact {
  @Column({ type: 'varchar' })
  @IsString()
  public url: string;
}
