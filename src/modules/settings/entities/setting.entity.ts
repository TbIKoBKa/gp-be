import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'settings' })
export class SettingEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  public key: string;

  @Column({ type: 'text' })
  public value: string;
}
