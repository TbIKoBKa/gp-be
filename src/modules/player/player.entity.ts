import { Column, Entity, ManyToMany } from "typeorm";
import { Exclude } from "class-transformer";

import { IPlayer } from "./interfaces";
import { IdDateBaseEntity } from "../../common/entity";
import { IsOptional, IsString, IsInt, IsNumber } from "class-validator";
import { PermissionEntity } from "../permissions/permission.entity";

@Entity({ name: 'players' })
export class PlayerEntity extends IdDateBaseEntity implements IPlayer {
  @Exclude()
  @Column({ type: "varchar", select: false })
  public password: string;

  @Column({ type: 'varchar' })
  @IsString()
  public username: string;

  @Column({ type: 'varchar' })
  @IsString()
  public realname: string;

  @Exclude()
  @Column({ type: "varchar", select: false })
  @IsString()
  public ip: string;

  @Column({ type: "bigint" })
  @IsInt()
  public lastlogin: number;

  @Column({ type: "double" })
  @IsNumber()
  public x: number;

  @Column({ type: "double" })
  @IsNumber()
  public y: number;

  @Column({ type: "double" })
  @IsNumber()
  public z: number;

  @Column({ type: "varchar" })
  @IsString()
  public world: string;

  @Column({ type: "bigint" })
  @IsInt()
  public regdate: number;

  @Exclude()
  @Column({ type: "varchar", select: false })
  @IsString()
  public regip: string;

  @Column({ type: "float" })
  @IsNumber()
  public yaw: number;

  @Column({ type: "float" })
  @IsNumber()
  public pitch: number;

  @Column({ type: "varchar" })
  @IsString()
  public email: string;

  @Column({ type: "smallint" })
  @IsInt()
  public isLogged: number;

  @Column({ type: "smallint" })
  @IsInt()
  public hasSession: number;

  @Column({ type: "varchar" })
  @IsString()
  public totp: string;

  @IsString()
  @IsOptional()
  public uuid: string;

  @IsString()
  @IsOptional()
  public avatar: string;

  @IsString()
  @IsOptional()
  public fullbody: string;

  @ManyToMany(() => PermissionEntity)
  @IsOptional()
  public permission?: PermissionEntity | undefined;
}
