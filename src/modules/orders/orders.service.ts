import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';

import { BuyDto, CompleteOrderDto, GetClientTokenDto } from './dto';
import { OrderEntity } from './orders.entity';
import { RconService } from '../rcon/rcon.service';
import { PermissionEntityEntity } from '../permissions/permissionEntity.entity';
import { BuyPeriodType } from '../../common/types';
import { convertCurrency } from '../../utils/convertCurrency';
import { ProductEntity } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersEntityRepository: Repository<OrderEntity>,
    @InjectRepository(PermissionEntityEntity)
    private readonly permissionEntityEntityRepository: Repository<PermissionEntityEntity>,
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>,
    private readonly configService: ConfigService,
    private readonly rcon: RconService
  ) {}

  private readonly PP_URL = this.configService.get('PP_URL');
  private readonly PP_CLIENT_ID = this.configService.get('PP_CLIENT_ID');
  private readonly PP_SECRET = this.configService.get('PP_SECRET');

  public async search(): Promise<[Array<OrderEntity>, number]> {
    return this.ordersEntityRepository.findAndCount();
  }

  public async buy(id: number, body: BuyDto): Promise<OrderEntity> {
    const { currency, period, nickname, args, language, orderId } = body;

    const matchOne = await this.productEntityRepository.findOneBy({
      id,
    });

    if (matchOne) {
      // const LIQPAY_PUBLIC_KEY = this.configService.get('LIQPAY_PUBLIC_KEY');
      // const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');
      // const LIQPAY_SERVER_URL = this.configService.get('LIQPAY_SERVER_URL');

      const periodPrice =
        period === BuyPeriodType.MONTH
          ? matchOne.price_month
          : matchOne.price_forever;

      const targetPrice = await convertCurrency('USDT', currency, periodPrice);

      const createdOrder = await this.ordersEntityRepository
        .create({
          amount: targetPrice,
          currency,
          status: 'pending',
          external_id: orderId,
          meta: {
            product_id: matchOne.id,
            nickname,
            period,
            language,
            args,
          },
        })
        .save();

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

      return createdOrder;
    }

    throw new NotFoundException();
  }

  public async completeOrder({ order_id }: CompleteOrderDto) {
    const matchOne = await this.ordersEntityRepository.findOne({
      where: {
        external_id: order_id,
      },
    });

    if (matchOne) {
      try {
        this.ordersEntityRepository.update(
          { id: matchOne.id },
          { status: 'success' }
        );

        const args: string[] = matchOne.meta.args;
        const product_id: number = matchOne.meta.product_id;

        const product = await this.productEntityRepository.findOneBy({
          id: product_id,
        });

        if (product) {
          const command = args.reduce(
            (c, a, i) => c.replaceAll(`{${i}}`, a),
            product?.command
          );

          console.log(command);

          await this.rcon.sendCommandClassic(command);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  public async getClientToken({ customer_id }: GetClientTokenDto) {
    try {
      const accessToken = await this.getAccessToken();

      const payload = customer_id ? JSON.stringify({ customer_id }) : null;

      const response: AxiosResponse<{ client_token: string }> =
        await axios.post(this.PP_URL + '/v1/identity/generate-token', payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

      return response.data.client_token;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  public async callback() {
    // const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');

    try {
      // const targetSignature = getSignature({
      //   data,
      //   privateKey: LIQPAY_PRIVATE_KEY,
      // });

      // if (signature !== targetSignature) {
      //   throw new NotFoundException();
      // }

      // const { order_id, status } = getDataObjectFromDataString(data);

      // await this.ordersEntityRepository.update(
      //   { id: Number(order_id) },
      //   { status }
      // );

      throw new NotFoundException();
    } catch (error) {
      console.error(error);
      throw new NotFoundException();
    }
  }

  public findOne(
    where: FindOptionsWhere<OrderEntity>
  ): Promise<OrderEntity | null> {
    return this.ordersEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<OrderEntity>): Promise<DeleteResult> {
    return this.ordersEntityRepository.delete(where);
  }

  private getAccessToken = async () => {
    const auth = `${this.PP_CLIENT_ID}:${this.PP_SECRET}`;
    const data = 'grant_type=client_credentials';
    const response: AxiosResponse<{ access_token: string }> = await axios.post(
      this.PP_URL + '/v1/oauth2/token',
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  };
}
