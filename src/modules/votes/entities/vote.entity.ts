import { Column, Entity } from 'typeorm';

import { IdDateBaseEntity } from '../../../common/entity';

@Entity({ name: 'votes' })
export class VoteEntity extends IdDateBaseEntity {
  @Column({ type: 'varchar' })
  public nickname: string;

  @Column({ type: 'varchar', name: 'created_at' })
  public createdAt: string;
}
