import { Column, Entity } from 'typeorm';
import { IsNumber, IsString } from 'class-validator';

import { IdDateBaseEntity } from '../../../common/entity';

@Entity({ name: 'products' })
export class ProductEntity extends IdDateBaseEntity {
  @Column({ type: 'varchar' })
  @IsString()
  public title: string;

  @Column({ type: 'varchar' })
  @IsString()
  public image: string;

  @Column({ type: 'float' })
  @IsNumber()
  public price_forever: number;

  @Column({ type: 'float' })
  @IsNumber()
  public price_month: number;

  @Column({ type: 'varchar' })
  @IsString()
  public command: string;
}
