import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * С какого адреса игрок зарегистрировался. Таблицу создаёт и пишет GoPlayBridge на прокси
 * (база LimboAuth), бэкенд её только читает.
 */
@Entity({ name: 'GOPLAY_REG_SOURCE' })
export class RegistrationSourceEntity {
  @PrimaryColumn({ name: 'UUID' })
  public uuid: string;

  @Column({ name: 'NICKNAME' })
  public nickname: string;

  @Column({ name: 'HOST' })
  public host: string;

  @Column({ name: 'BEDROCK', type: 'tinyint' })
  public bedrock: number;

  @Column({ name: 'IP' })
  public ip: string;

  @Column({ name: 'REG_DATE', type: 'bigint' })
  public regDate: string;

  @Column({ name: 'PLAYTIME_SEC', type: 'int' })
  public playtimeSec: number;

  @Column({ name: 'RETURN_AT', type: 'bigint', nullable: true })
  public returnAt: string | null;

  @Column({ name: 'LAST_SEEN', type: 'bigint', nullable: true })
  public lastSeen: string | null;
}
