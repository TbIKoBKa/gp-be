import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum VoteSource {
  HOTMC = 'hotmc',
  MINESERV = 'mineserv',
}

@Entity({ name: 'votes' })
export class VoteEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'varchar', nullable: true })
  public source: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  public createdAt: Date;
}
