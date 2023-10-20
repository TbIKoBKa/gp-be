import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';

import { IsString, IsInt, IsNumber, IsOptional } from 'class-validator';
import { IdDateBaseEntity } from '../../../common/entity';
import { CoinsEntity } from './coins.entity';

@Entity({ name: 'players' })
export class AuthPlayerEntity extends IdDateBaseEntity {
  @Column({ type: 'varchar' })
  public password: string;

  @Column({ type: 'varchar' })
  @IsString()
  public username: string;

  @Column({ type: 'varchar' })
  @IsString()
  public realname: string;

  @Column({ type: 'varchar' })
  @IsString()
  public ip: string;

  @Column({ type: 'bigint' })
  @IsInt()
  public lastlogin: number;

  @Column({ type: 'double' })
  @IsNumber()
  public x: number;

  @Column({ type: 'double' })
  @IsNumber()
  public y: number;

  @Column({ type: 'double' })
  @IsNumber()
  public z: number;

  @Column({ type: 'varchar' })
  @IsString()
  public world: string;

  @Column({ type: 'bigint' })
  @IsInt()
  public regdate: number;

  @Column({ type: 'varchar' })
  @IsString()
  public regip: string;

  @Column({ type: 'float' })
  @IsNumber()
  public yaw: number;

  @Column({ type: 'float' })
  @IsNumber()
  public pitch: number;

  @Column({ type: 'varchar' })
  @IsString()
  public email: string;

  @Column({ type: 'smallint' })
  @IsInt()
  public isLogged: number;

  @Column({ type: 'smallint' })
  @IsInt()
  public hasSession: number;

  @Column({ type: 'varchar' })
  @IsString()
  public totp: string;

  @OneToOne(() => CoinsEntity)
  @JoinColumn({ name: 'username', referencedColumnName: 'nick' })
  @IsOptional()
  public coins?: CoinsEntity;
}
