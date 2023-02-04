import { Column, Entity } from 'typeorm';

import { IOrder } from './interfaces';
import { IdDateBaseEntity } from '../../common/entity';
import { CurrencyType } from '../../common/types';

@Entity({ name: 'orders' })
export class OrderEntity extends IdDateBaseEntity implements IOrder {
  @Column({ type: 'varchar' })
  public id: number;

  @Column({ type: 'float' })
  public amount: number;

  @Column({ type: 'varchar' })
  public currency: CurrencyType;

  @Column({ type: 'varchar' })
  public status: string;

  @Column({ type: 'json', nullable: true })
  public meta?: any;

  @Column({ type: 'datetime' })
  public created_at: string;
}
