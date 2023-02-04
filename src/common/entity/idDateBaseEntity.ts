import { Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

export interface IIdDateBase {
  id: number;
}

@Entity()
export class IdDateBaseEntity extends BaseEntity implements IIdDateBase {
  @PrimaryGeneratedColumn()
  public id: number;
}
