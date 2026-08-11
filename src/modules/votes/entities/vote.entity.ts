import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum VoteSource {
  HOTMC = 'hotmc',
  MINESERV = 'mineserv',
  TOP_MINECRAFTER = 'top-minecrafter',
}

@Entity({ name: 'votes' })
// Prevents double-crediting for pull-based providers. Webhook sources leave external_id
// NULL, and MySQL treats NULLs as distinct in a unique index.
@Index('IDX_votes_source_external_id', ['source', 'externalId'], { unique: true })
export class VoteEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'varchar', nullable: true })
  public source: string;

  @Column({ name: 'external_id', type: 'varchar', length: 100, nullable: true })
  public externalId: string | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  public createdAt: Date;
}
