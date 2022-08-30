import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, DeleteResult, FindOptionsWhere, Repository } from "typeorm";

import { AuthMeEntity } from "./auth.entity";
import { IAuthMeSearchDto } from "./interfaces";

@Injectable()
export class AuthMeService {
  constructor(
    @InjectRepository(AuthMeEntity)
    private readonly authMeEntityRepository: Repository<AuthMeEntity>,
  ) {}

  public async search(dto: IAuthMeSearchDto): Promise<[Array<AuthMeEntity>, number]> {
    const { realname, username } = dto;
    const queryBuilder = this.authMeEntityRepository.createQueryBuilder("authme");

    queryBuilder.select();

    if (realname) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("authme.realname ILIKE '%' || :realname || '%'", { realname });
        }),
      );
    }

    if (username) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("authme.username ILIKE '%' || :username || '%'", { username });
        }),
      );
    }

    //TODO Maybe use pagination?
    // queryBuilder.orderBy(`authme.${sortBy}`, sort.toUpperCase());

    // queryBuilder.skip(skip);
    // queryBuilder.take(take);

    return queryBuilder.getManyAndCount();
  }

  public findOne(where: FindOptionsWhere<AuthMeEntity>): Promise<AuthMeEntity | null> {
    return this.authMeEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<AuthMeEntity>): Promise<DeleteResult> {
    return this.authMeEntityRepository.delete(where);
  }
}
