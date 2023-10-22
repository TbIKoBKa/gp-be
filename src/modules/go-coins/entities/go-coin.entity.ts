import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'GoCoins' })
export class GoCoinEntity extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  public id: number;

  @Column({ type: 'varchar' })
  public nick: string;

  @Column({ type: 'double' })
  public balance: number;
}
