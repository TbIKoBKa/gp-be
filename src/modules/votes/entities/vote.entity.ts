import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'votes' })
export class VoteEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'varchar', name: 'created_at' })
  public createdAt: string;
}
