import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';

import { OrderEntity } from '../orders/orders.entity';
import { PermissionEntityEntity } from './permissionEntity.entity';
import { IPermissionBuyResponseDto, IPermissionEntity } from './interfaces';
import { PermissionsType } from './types';
import { PermissionBuyDto } from './dto';
import { BuyPeriodType, CurrencyType } from '../../common/types';
import { convertCurrency } from '../../utils/convertCurrency';

const totalPermissions: string[] = Object.values(PermissionsType);

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntityEntity)
    private readonly permissionEntityEntityRepository: Repository<PermissionEntityEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderEntityRepository: Repository<OrderEntity>,
    private readonly configService: ConfigService
  ) {}

  public async search(): Promise<IPermissionEntity[]> {
    const queryBuilder =
      this.permissionEntityEntityRepository.createQueryBuilder(
        'permissions_entity'
      );

    queryBuilder.select();

    const permissions = await queryBuilder.getMany();

    const filteredPermissions = totalPermissions
      .map((permission) => {
        return permissions.find((item) => item.name === permission);
      })
      .filter((item) => item);

    return filteredPermissions as unknown as PermissionEntityEntity[];
  }

  public async buy(
    id: number,
    body: PermissionBuyDto
  ): Promise<IPermissionBuyResponseDto> {
    const { currency, period, nickname, language } = body;

    const matchOne = await this.permissionEntityEntityRepository.findOneBy({
      id,
    });

    if (matchOne) {
      const LIQPAY_PUBLIC_KEY = this.configService.get('LIQPAY_PUBLIC_KEY');
      const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');
      const LIQPAY_SERVER_URL = this.configService.get('LIQPAY_SERVER_URL');

      const periodPrice =
        period === BuyPeriodType.MONTH
          ? matchOne.price_month
          : matchOne.price_forever;

      const targetPrice =
        currency === CurrencyType.RUB
          ? periodPrice
          : await convertCurrency(
              'RUB',
              currency,
              periodPrice,
              this.configService.get('NODE_ENV') !== 'development'
            );

      const createdOrder = await this.orderEntityRepository
        .create({
          amount: targetPrice,
          currency,
          meta: {
            nickname,
            period,
            permission_id: matchOne.id,
          },
        })
        .save();

      const json_string = JSON.stringify({
        version: 3,
        public_key: LIQPAY_PUBLIC_KEY,
        private_key: LIQPAY_PRIVATE_KEY,
        action: 'pay',
        amount: targetPrice,
        currency,
        description: matchOne.name[0].toUpperCase() + matchOne.name.slice(1),
        order_id: String(createdOrder.id),
        product_name: matchOne.name,
        server_url: LIQPAY_SERVER_URL,
        language,
      });

      const data = Buffer.from(json_string).toString('base64');

      const sign_string = LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY;
      const shasum = crypto.createHash('sha1');
      shasum.update(sign_string);
      const signature = shasum.digest('base64');

      return { data, signature };
    }
    throw new NotFoundException();
  }
}
