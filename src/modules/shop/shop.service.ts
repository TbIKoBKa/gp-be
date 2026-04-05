import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

import { OrderEntity, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { catalog, findVariant } from './catalog';
import { BridgeService } from '../bridge/bridge.service';

const FREEKASSA_IPS = [
  '168.119.157.136',
  '168.119.60.227',
  '138.201.88.124',
  '178.154.197.79',
];

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly configService: ConfigService,
    private readonly bridgeService: BridgeService,
  ) {}

  getProducts() {
    return catalog.map(({ id, type, name, image, description, variants }) => ({
      id,
      type,
      name,
      image,
      description,
      variants: variants.map(({ id: vid, label, price }) => ({ id: vid, label, price })),
    }));
  }

  async createOrder(dto: CreateOrderDto) {
    const found = findVariant(dto.variantId);
    if (!found) throw new BadRequestException('Unknown variant');

    const { product, variant } = found;

    const order = await this.orderRepository.save({
      playerName: dto.playerName,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label,
      amount: variant.price,
    });

    const merchantId = this.configService.get<string>('FREEKASSA_MERCHANT_ID');
    const secret1 = this.configService.get<string>('FREEKASSA_SECRET1');
    const amount = variant.price.toFixed(2);
    const currency = 'RUB';

    const sign = createHash('md5')
      .update(`${merchantId}:${amount}:${secret1}:${currency}:${order.id}`)
      .digest('hex');

    const paymentUrl = new URL('https://pay.freekassa.com/');
    paymentUrl.searchParams.set('m', merchantId!);
    paymentUrl.searchParams.set('oa', amount);
    paymentUrl.searchParams.set('currency', currency);
    paymentUrl.searchParams.set('o', String(order.id));
    paymentUrl.searchParams.set('s', sign);
    paymentUrl.searchParams.set('lang', 'ru');
    paymentUrl.searchParams.set('em', '');

    return {
      orderId: order.id,
      paymentUrl: paymentUrl.toString(),
    };
  }

  async getOrder(id: number) {
    return this.orderRepository.findOne({ where: { id } });
  }

  async handleWebhook(
    ip: string,
    body: Record<string, string>,
  ) {
    if (!FREEKASSA_IPS.includes(ip)) {
      throw new ForbiddenException('Invalid source IP');
    }

    const { MERCHANT_ID, AMOUNT, intid, SIGN, MERCHANT_ORDER_ID, P_EMAIL, CUR_ID } = body;

    const merchantId = this.configService.get<string>('FREEKASSA_MERCHANT_ID');
    const secret2 = this.configService.get<string>('FREEKASSA_SECRET2');

    const expectedSign = createHash('md5')
      .update(`${merchantId}:${AMOUNT}:${secret2}:${MERCHANT_ORDER_ID}`)
      .digest('hex');

    if (SIGN !== expectedSign) {
      this.logger.warn(`Invalid webhook signature for order ${MERCHANT_ORDER_ID}`);
      throw new ForbiddenException('Invalid signature');
    }

    const orderId = parseInt(MERCHANT_ORDER_ID, 10);
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found`);
      throw new BadRequestException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      return 'YES';
    }

    order.status = OrderStatus.PAID;
    order.fkOrderId = intid;
    await this.orderRepository.save(order);

    await this.deliverOrder(order);

    return 'YES';
  }

  private async deliverOrder(order: OrderEntity) {
    const found = findVariant(order.variantId);
    if (!found) {
      this.logger.error(`Variant ${order.variantId} not found for order ${order.id}`);
      order.status = OrderStatus.FAILED;
      await this.orderRepository.save(order);
      return;
    }

    const { variant } = found;

    try {
      for (const cmdTemplate of variant.commands) {
        const command = cmdTemplate.replace(/{player}/g, order.playerName);
        await this.bridgeService.execute('grief', command);
      }

      order.status = OrderStatus.DELIVERED;
      await this.orderRepository.save(order);
      this.logger.log(`Order ${order.id} delivered to ${order.playerName}`);
    } catch (error) {
      this.logger.error(`Failed to deliver order ${order.id}: ${error}`);
      order.status = OrderStatus.FAILED;
      await this.orderRepository.save(order);
    }
  }
}
