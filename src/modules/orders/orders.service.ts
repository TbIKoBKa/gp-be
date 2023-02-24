import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';

import { OrderEntity } from './orders.entity';
import { CallbackOrderDto } from './dto';
import { getDataObjectFromDataString, getSignature } from '../../utils/liqpay';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersEntityRepository: Repository<OrderEntity>,
    private readonly configService: ConfigService
  ) {}

  public async search(): Promise<[Array<OrderEntity>, number]> {
    return this.ordersEntityRepository.findAndCount();
  }

  public async callback({ data, signature }: CallbackOrderDto) {
    const LIQPAY_PRIVATE_KEY = this.configService.get('LIQPAY_PRIVATE_KEY');

    try {
      const targetSignature = getSignature({
        data,
        privateKey: LIQPAY_PRIVATE_KEY,
      });

      if (signature !== targetSignature) {
        throw new NotFoundException();
      }

      const { order_id, status } = getDataObjectFromDataString(data);

      await this.ordersEntityRepository.update(
        { id: Number(order_id) },
        { status }
      );

      return { id: Number(order_id), status };
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
}
