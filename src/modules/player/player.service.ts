import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LimboAuthPlayer } from '../auth/entities/limboauth-player.entity';

interface PlayerSearchDto {
  nickname?: string;
}

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(LimboAuthPlayer, 'minecraft')
    private readonly authRepository: Repository<LimboAuthPlayer>,
  ) {}

  async search(dto: PlayerSearchDto): Promise<[Array<Record<string, unknown>>, number]> {
    const qb = this.authRepository.createQueryBuilder('auth');

    qb.select([
      'auth.nickname',
      'auth.uuid',
      'auth.regDate',
      'auth.loginDate',
    ]);

    if (dto.nickname) {
      qb.where('auth.lowercaseNickname LIKE :nick', {
        nick: `%${dto.nickname.toLowerCase()}%`,
      });
    }

    qb.take(20);

    const [players, count] = await qb.getManyAndCount();
    return [players.map(this.sanitize), count];
  }

  async getRandom() {
    const player = await this.authRepository
      .createQueryBuilder('auth')
      .select(['auth.nickname', 'auth.uuid', 'auth.regDate', 'auth.loginDate'])
      .orderBy('RAND()')
      .limit(1)
      .getOne();

    return player ? this.sanitize(player) : null;
  }

  private sanitize(player: LimboAuthPlayer) {
    return {
      nickname: player.nickname,
      uuid: player.uuid,
      regDate: player.regDate,
      loginDate: player.loginDate,
    };
  }
}
