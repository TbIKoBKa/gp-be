import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LuckPrizeType {
  NOTHING = 'NOTHING',
  GOCOINS = 'GOCOINS',
}

@Entity({ name: 'luck_spins' })
export class LuckSpinEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'enum', enum: LuckPrizeType, default: LuckPrizeType.NOTHING })
  public prizeType: LuckPrizeType;

  @Column({ type: 'int', default: 0 })
  public prizeAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
}
