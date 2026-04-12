import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'server_status_hourly' })
export class ServerStatusHourlyEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index({ unique: true })
  @Column({ type: 'timestamp' })
  public hour: Date;

  @Column({ name: 'avg_players', type: 'float' })
  public avgPlayers: number;

  @Column({ name: 'min_players', type: 'int' })
  public minPlayers: number;

  @Column({ name: 'max_players', type: 'int' })
  public maxPlayers: number;

  @Column({ name: 'uptime_percent', type: 'float' })
  public uptimePercent: number;

  @Column({ name: 'check_count', type: 'int' })
  public checkCount: number;
}
