import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Brackets, DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import { PermissionEntity } from '../permissions/permissions.entity';
import { PermissionInheritanceEntity } from '../permissions/permissionInheritance.entity';

import { PlayerEntity } from './player.entity';
import { IPlayerSearchDto } from './interfaces';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playersEntityRepository: Repository<PlayerEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  public async search(
    dto: IPlayerSearchDto
  ): Promise<[Array<PlayerEntity>, number]> {
    const { nickname } = dto;
    const queryBuilder =
      this.playersEntityRepository.createQueryBuilder('players');

    queryBuilder.select();

    if (nickname) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(`players.username LIKE '%${nickname.toLowerCase()}%'`);
        })
      );
    }

    queryBuilder.leftJoinAndMapOne(
      'players.permission',
      PermissionEntity,
      'permission',
      'players.realname = permission.value'
    );
    queryBuilder.leftJoinAndMapOne(
      'permission.permissionInheritance',
      PermissionInheritanceEntity,
      'permissionInheritance',
      'permission.name = permissionInheritance.child'
    );

    //TODO Maybe use pagination & sort?
    // queryBuilder.orderBy(`players.${sortBy}`, sort.toUpperCase());

    // queryBuilder.skip(skip);
    queryBuilder.take(20);

    const playersList = await queryBuilder.getManyAndCount();

    const MOJANG_API = this.configService.get('MOJANG_API');
    const MCHEAD_API = this.configService.get('MCHEAD_API');

    const mappedPlayers = playersList[0].map(async (player) => {
      const response = await lastValueFrom(
        this.httpService.get(
          `${MOJANG_API}/users/profiles/minecraft/${player.username}`
        )
      ).catch(() => {});

      const uuid: string =
        response?.data?.id || 'f680df9bac5c4d3f9bac75bc0e316afa';

      const avatar = `${MCHEAD_API}/avatar/${uuid}`;
      const fullbody = `${MCHEAD_API}/player/${uuid}`;

      player.avatar = avatar;
      player.fullbody = fullbody;
      player.uuid = uuid;

      return player;
    });

    const responseList = await Promise.all(mappedPlayers);

    return [responseList, playersList[1]];
  }

  public findOne(
    where: FindOptionsWhere<PlayerEntity>
  ): Promise<PlayerEntity | null> {
    return this.playersEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<PlayerEntity>): Promise<DeleteResult> {
    return this.playersEntityRepository.delete(where);
  }
}
