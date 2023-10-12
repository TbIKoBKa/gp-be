import { Column, Entity } from 'typeorm';

import { IsString, IsNumber } from 'class-validator';
import { IdDateBaseEntity } from '../../../common/entity';

@Entity({ name: 'tokens' })
export class TokenEntity extends IdDateBaseEntity {
  @Column({ type: 'int' })
  @IsNumber()
  public player_id: number;

  @Column({ type: 'varchar' })
  @IsString()
  public access_token: string;

  @Column({ type: 'varchar' })
  @IsString()
  public refresh_token: string;
}
