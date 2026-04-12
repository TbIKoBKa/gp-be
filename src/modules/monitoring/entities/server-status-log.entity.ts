import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'server_status_logs' })
export class ServerStatusLogEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'boolean' })
  public online: boolean;

  @Column({ name: 'players_online', type: 'int' })
  public playersOnline: number;

  @Column({ name: 'players_max', type: 'int' })
  public playersMax: number;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
}
