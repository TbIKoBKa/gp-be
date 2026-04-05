import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AUTH' })
export class LimboAuthPlayer {
  @PrimaryColumn({ name: 'LOWERCASENICKNAME' })
  lowercaseNickname: string;

  @Column({ name: 'NICKNAME' })
  nickname: string;

  @Column({ name: 'HASH' })
  hash: string;

  @Column({ name: 'IP' })
  ip: string;

  @Column({ name: 'LOGINIP', nullable: true })
  loginIp: string;

  @Column({ name: 'TOTPTOKEN', nullable: true })
  totpToken: string;

  @Column({ name: 'REGDATE', type: 'bigint', nullable: true })
  regDate: number;

  @Column({ name: 'LOGINDATE', type: 'bigint', nullable: true })
  loginDate: number;

  @Column({ name: 'UUID' })
  uuid: string;

  @Column({ name: 'PREMIUMUUID', nullable: true })
  premiumUuid: string;

  @Column({ name: 'ISSUEDTIME', type: 'bigint', nullable: true })
  tokenIssuedAt: number;
}
