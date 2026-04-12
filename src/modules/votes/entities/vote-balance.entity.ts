import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'vote_balances' })
export class VoteBalanceEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', unique: true })
  public nickname: string;

  @Column({ type: 'int', default: 0 })
  public balance: number;

  @Column({ type: 'int', default: 0, name: 'total_votes' })
  public totalVotes: number;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
