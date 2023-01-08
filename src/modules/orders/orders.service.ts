import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, FindOptionsWhere, Repository } from "typeorm";

import { OrderEntity } from "./orders.entity";
import { CallbackOrderDto } from "./dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersEntityRepository: Repository<OrderEntity>,
    private readonly configService: ConfigService,
  ) {}

  public async search(): Promise<[Array<OrderEntity>, number]> {
    return this.ordersEntityRepository.findAndCount();
  }

  public async callback(body: CallbackOrderDto) {
    // const { data, signature } = body;

    console.log('body', body);

    // const LIQPAY_PUBLIC_KEY = this.configService.get('LIQPAY_PUBLIC_KEY');

    // if (LIQPAY_PUBLIC_KEY !== public_key) {
    //   throw new UnauthorizedException();
    // }

    // const matchOrder = await this.ordersEntityRepository.findOneBy({
    //   id: Number(order_id),
    // });

    // if (matchOrder) {
    //   await this.ordersEntityRepository.update({ id: Number(order_id) }, { status });

    //   return { ...matchOrder, status };
    // }

    // throw new NotFoundException();

    return 'Callback';
  }

  public findOne(where: FindOptionsWhere<OrderEntity>): Promise<OrderEntity | null> {
    return this.ordersEntityRepository.findOne({ where });
  }

  public delete(where: FindOptionsWhere<OrderEntity>): Promise<DeleteResult> {
    return this.ordersEntityRepository.delete(where);
  }
}
