import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Рекламная кампания: секретная ссылка на статистику и адреса сервера, регистрации через
 * которые ей засчитываются. Заводится вручную SQL-запросом, см. README модуля.
 */
@Entity({ name: 'partner_campaigns' })
export class PartnerCampaignEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 100 })
  public name: string;

  /** Токен из ссылки `go-play.gg/partner/<token>`: 32 hex-символа. */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  public token: string;

  /** Адреса в нижнем регистре, как их пишет GoPlayBridge: `["promo.go-play.gg"]`. */
  @Column({ type: 'simple-json' })
  public hosts: string[];

  @Column({ name: 'starts_at', type: 'datetime' })
  public startsAt: Date;

  @Column({ name: 'ends_at', type: 'datetime', nullable: true })
  public endsAt: Date | null;

  @Column({ type: 'boolean', default: true })
  public active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;
}
