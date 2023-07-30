import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductsService {
  constructor(private configService: ConfigService) {}

  private api = axios.create({
    baseURL: 'https://easydonate.ru/api/v3/shop',
    headers: {
      'Shop-Key': this.configService.get('EASYDONATE_SHOP_KEY'),
    },
  });

  // create(createProductDto: CreateProductDto) {
  //   return 'This action adds a new product';
  // }

  async findAll() {
    const res = await this.api.get('products');

    return res.data.response;
  }

  async findOne(id: number) {
    const res = await this.api.get(`products/${id}`);

    return res.data.response;
  }

  // update(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
