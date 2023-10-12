import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeleteResult, FindOptionsWhere, Repository } from 'typeorm';

import { PlayerEntity } from './player.entity';
import { IPlayerSearchDto } from './interfaces';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(PlayerEntity)
    private readonly playersEntityRepository: Repository<PlayerEntity>
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

    //TODO Maybe use pagination & sort?
    // queryBuilder.orderBy(`players.${sortBy}`, sort.toUpperCase());

    // queryBuilder.skip(skip);
    queryBuilder.take(20);

    const playersList = await queryBuilder.getManyAndCount();

    return playersList;
  }

  public async getRandom() {
    const list = await this.playersEntityRepository.find();

    const max = await this.playersEntityRepository.count();
    const randomNumber = Math.floor(Math.random() * max);

    return list[randomNumber];
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
