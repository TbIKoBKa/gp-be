import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CurrencyType } from '../../common/types';
import { GoCoinsService } from '../go-coins/go-coins.service';
import { RconService } from '../rcon/rcon.service';
// import qs from 'qs';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly goCoinsService: GoCoinsService,
    private readonly rconService: RconService
  ) {}

  private api = axios.create({
    baseURL: 'https://easydonate.ru/api/v3/shop',
    headers: {
      'Shop-Key': this.configService.get('EASYDONATE_SHOP_KEY'),
    },
  });

  async create({
    customer,
    products,
    server_id,
    payment_method,
  }: CreatePaymentDto) {
    if (payment_method === CurrencyType.GOIN) {
      const product = (await this.api.get(`product/${products[0]}`)).data
        .response;

      const res = await this.goCoinsService.getGoCoinsByNickname(customer);

      if (res && product && res?.balance > product.price) {
        await this.goCoinsService.updateBalance(customer, -product.price);

        await Promise.all(
          product.commands.map((cmd: string) =>
            this.rconService.sendCommand(cmd.replaceAll('{user}', customer))
          )
        );
      } else {
        throw new BadRequestException('notEnoughBalance');
      }
    } else {
      const productsParam = products.reduce((t, p) => {
        t[p] = 1;
        return t;
      }, {} as Record<number, number>);

      const res = await this.api
        .get(`payment/create`, {
          params: {
            customer,
            server_id,
            products: JSON.stringify(productsParam),
            success_url: this.configService.get('FE_URL'),
          },
        })
        .catch(console.log);

      return res?.data.response;
    }
  }

  async count() {
    const res = await this.api.get(`payments`).catch(console.log);

    return res?.data.response.filter((p: any) => p.payment_type !== 'test')
      .length;
  }
}
