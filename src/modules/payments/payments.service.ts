import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
// import qs from 'qs';

@Injectable()
export class PaymentsService {
  constructor(private configService: ConfigService) {}

  private api = axios.create({
    baseURL: 'https://easydonate.ru/api/v3/shop',
    headers: {
      'Shop-Key': this.configService.get('EASYDONATE_SHOP_KEY'),
    },
  });

  async create({ customer, products, server_id }: CreatePaymentDto) {
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

  async count() {
    const res = await this.api.get(`payments`).catch(console.log);

    return res?.data.response.filter((p: any) => p.payment_type !== 'test')
      .length;
  }
}
