import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'GoCoins_Data' })
export class CoinsEntity extends BaseEntity {
  @PrimaryColumn({ type: 'varchar' })
  public uuid: number;

  @Column({ type: 'varchar' })
  public nick: string;

  @Column({ type: 'double' })
  public balance: number;

  @Column({ type: 'mediumtext' })
  public lastlogin: string;
}
