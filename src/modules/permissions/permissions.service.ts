import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

import { OrderEntity } from '../orders/orders.entity';
import { PermissionEntityEntity } from './permissionEntity.entity';
import { IPermissionBuyResponseDto, IPermissionEntity } from './interfaces';
import { PermissionsType } from './types';
import { PermissionBuyDto } from './dto';
import { BuyPeriodType, CurrencyType } from '../../common/types';
import { convertCurrency } from '../../utils/convertCurrency';
// import { getDataStringFromDataObject, getSignature } from '../../utils/liqpay';

const totalPermissions: string[] = Object.values(PermissionsType);

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionEntityEntity)
    private readonly permissionEntityEntityRepository: Repository<PermissionEntityEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderEntityRepository: Repository<OrderEntity>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
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
    const { currency, period, nickname } = body;

    const matchOne = await this.permissionEntityEntityRepository.findOneBy({
      id,
    });

    if (matchOne) {
      // const LIQPAY_PUBLIC_KEY = this.configService.get('LIQPAY_PUBLIC_KEY');
      // const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');
      // const LIQPAY_SERVER_URL = this.configService.get('LIQPAY_SERVER_URL');

      const INTERKASSA_CHECKOUT_ID = this.configService.get(
        'INTERKASSA_CHECKOUT_ID'
      );
      // const INTERKASSA_SIGN_KEY = this.configService.get('INTERKASSA_SIGN_KEY');

      const PP_TOKEN = this.configService.get('PP_TOKEN');
      const PP_SHOP_ID = this.configService.get('PP_SHOP_ID');

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
          status: 'pending',
          meta: {
            nickname,
            period,
            permission_id: matchOne.id,
            ik_meta:
              currency !== CurrencyType.RUB
                ? {
                    ik_co_id: INTERKASSA_CHECKOUT_ID,
                    ik_cur: currency,
                    ik_am: targetPrice,
                    ik_desc:
                      matchOne.name[0].toUpperCase() + matchOne.name.slice(1),
                    ik_products: String(matchOne.id),
                  }
                : void 0,
          },
        })
        .save();

      if (currency === CurrencyType.RUB) {
        return lastValueFrom(
          this.httpService
            .post(
              'https://paypalych.com/api/v1/bill/create',
              {
                amount: targetPrice,
                order_id: String(createdOrder.id),
                name: matchOne.name[0].toUpperCase() + matchOne.name.slice(1),
                shop_id: PP_SHOP_ID,
              },
              {
                headers: {
                  Authorization: `Bearer ${PP_TOKEN}`,
                },
              }
            )
            .pipe(
              map((res) => res.data),
              catchError((error: AxiosError) => {
                console.error(error.response?.data);
                throw 'An error happened!';
              })
            )
        );
      } else {
        return lastValueFrom(
          this.httpService
            .post(
              'https://sci.interkassa.com',
              {
                ik_co_id: INTERKASSA_CHECKOUT_ID,
                ik_pm_no: String(createdOrder.id),
                ik_cur: currency,
                ik_am: targetPrice,
                ik_desc:
                  matchOne.name[0].toUpperCase() + matchOne.name.slice(1),
                ik_products: String(matchOne.id),
                ik_int: 'json',
                ik_act: 'process',
                ik_mode: 'invoice',
                ik_payment_currency: 'XTS',
                ik_payment_method: 'test',
              },
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              }
            )
            .pipe(
              map(
                ({
                  data: {
                    resultData: {
                      paymentForm: { action },
                    },
                  },
                }) => ({ link_page_url: action })
              ),
              catchError((error: AxiosError) => {
                console.error(error.response?.data);
                console.error(error.response?.status);
                throw 'An error happened!';
              })
            )
        );
        // const json = {
        //   version: 3,
        //   public_key: LIQPAY_PUBLIC_KEY,
        //   private_key: LIQPAY_PRIVATE_KEY,
        //   action: 'pay',
        //   amount: targetPrice,
        //   currency,
        //   description: matchOne.name[0].toUpperCase() + matchOne.name.slice(1),
        //   order_id: String(createdOrder.id),
        //   product_name: matchOne.name,
        //   server_url: LIQPAY_SERVER_URL,
        //   language,
        //   info: JSON.stringify({
        //     nickname,
        //     period,
        //     permission_id: matchOne.id,
        //   }),
        // };
        // const data = getDataStringFromDataObject(json);
        // const signature = getSignature({
        //   data,
        //   privateKey: LIQPAY_PRIVATE_KEY,
        // });
        // return { data, signature };
      }
    }

    throw new NotFoundException();
  }
}
