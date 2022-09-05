import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { lastValueFrom } from "rxjs";
import { Brackets, DeleteResult, FindOptionsWhere, Repository } from "typeorm";
import { PermissionEntity } from "../permissions/permission.entity";
import { PermissionInheritanceEntity } from "../permissions/permissionInheritance.entity";

import { AuthMeEntity } from "./auth.entity";
import { IAuthMeSearchDto } from "./interfaces";

@Injectable()
export class AuthMeService {
  constructor(
    @InjectRepository(AuthMeEntity)
    private readonly authMeEntityRepository: Repository<AuthMeEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async search(dto: IAuthMeSearchDto): Promise<[Array<AuthMeEntity>, number]> {
    const { realname, username } = dto;
    const queryBuilder = this.authMeEntityRepository.createQueryBuilder("authme");

    queryBuilder.select();

    if (realname) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(`authme.realname LIKE '%${realname}%'`);
        }),
      );
    }

    if (username) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(`authme.username LIKE '%${username}%'`);
        }),
      );
    }

    queryBuilder.leftJoinAndMapOne('authme.permission', PermissionEntity, 'permission', 'authme.realname = permission.value');
    queryBuilder.leftJoinAndMapOne('permission.permissionInheritance', PermissionInheritanceEntity, 'permissionInheritance', 'permission.name = permissionInheritance.child');

    //TODO Maybe use pagination & sort?
    // queryBuilder.orderBy(`authme.${sortBy}`, sort.toUpperCase());

    // queryBuilder.skip(skip);
    // queryBuilder.take(take);

    const authList = await queryBuilder.getManyAndCount();

    const MOJANG_API = this.configService.get('MOJANG_API');
    const MCHEAD_API = this.configService.get('MCHEAD_API');

    const mappedAuths = authList[ 0 ].map(async (auth) => {
      const { data } = await lastValueFrom(
        this.httpService.get(`${MOJANG_API}/users/profiles/minecraft/${auth.username}`),
      );

      const uuid: string = data.id;

      const avatar = `${MCHEAD_API}/avatar/${uuid}`;

      auth.avatar = avatar;
      auth.uuid = uuid;

      return auth;
    });

    const responseList = await Promise.all(mappedAuths);

    return [ responseList, authList[ 1 ] ];
  }

  public findOne(where: FindOptionsWhere<AuthMeEntity>): Promise<AuthMeEntity | null> {
    return this.authMeEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<AuthMeEntity>): Promise<DeleteResult> {
    return this.authMeEntityRepository.delete(where);
  }
}
