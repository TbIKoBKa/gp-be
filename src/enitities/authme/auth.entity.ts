import { Column, Entity } from "typeorm";
import { Exclude } from "class-transformer";

import { IAuth } from "./interfaces/authme";
import { IdDateBaseEntity } from "../../common/entity";


@Entity({ name: 'authme' })
export class AuthMeEntity extends IdDateBaseEntity implements IAuth {
  @Exclude()
  @Column({ type: "varchar", select: false })
  public password: string;

  @Column({ type: 'varchar' })
  public username: string;

  @Column({ type: 'varchar' })
  public realname: string;

  @Column({ type: "varchar" })
  public ip: string;

  @Column({ type: "bigint" })
  public lastlogin: number;

  @Column({ type: "double" })
  public x: number;

  @Column({ type: "double" })
  public y: number;

  @Column({ type: "double" })
  public z: number;

  @Column({ type: "varchar" })
  public world: string;

  @Column({ type: "bigint" })
  public regdate: number;

  @Column({ type: "varchar" })
  public regip: string;

  @Column({ type: "float" })
  public yaw: number;

  @Column({ type: "float" })
  public pitch: number;

  @Column({ type: "varchar" })
  public email: string;

  @Column({ type: "smallint" })
  public isLogged: number;

  @Column({ type: "smallint" })
  public hasSession: number;

  @Column({ type: "varchar" })
  public totp: string;
}
