import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum VoteSource {
  HOTMC = 'hotmc',
  MINESERV = 'mineserv',
  TMONITORING = 'tmonitoring',
}

@Entity({ name: 'votes' })
export class VoteEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'varchar', nullable: true })
  public source: string;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
}
