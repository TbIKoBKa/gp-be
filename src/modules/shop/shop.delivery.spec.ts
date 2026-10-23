import { Logger } from '@nestjs/common';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { ShopService } from './shop.service';
import type { BridgeResult } from '../bridge/bridge.service';

describe('ShopService delivery', () => {
  const MINUTE = 60_000;
  let saved: OrderEntity[];
  let stored: OrderEntity[];
  let replies: BridgeResult[];
  let service: ShopService;

  const order = (over: Partial<OrderEntity> = {}): OrderEntity =>
    ({
      id: 78,
      playerName: 'Steve',
      server: 'grief',
      variantId: 'mirage-1m',
      status: OrderStatus.PAID,
      createdAt: new Date(Date.now() - 5 * MINUTE),
      updatedAt: new Date(Date.now() - 2 * MINUTE),
      ...over,
    }) as OrderEntity;

  const deliver = (o: OrderEntity) => (service as unknown as { deliverOrder(o: OrderEntity): Promise<void> }).deliverOrder(o);

  beforeAll(() => Logger.overrideLogger(false));

  beforeEach(() => {
    saved = [];
    stored = [];
    replies = [];
    const repo = {
      save: async (o: OrderEntity) => (saved.push({ ...o }), o),
      find: async () => stored,
    };
    const bridge = { execute: async () => replies.shift()! };
    service = new ShopService(repo as never, {} as never, {} as never, bridge as never, {} as never, {} as never, {} as never, {} as never);
  });

  it('marks a delivered order', async () => {
    replies = [{ success: true, message: 'OK', uncertain: false }];
    const o = order();
    await deliver(o);
    expect(o.status).toBe(OrderStatus.DELIVERED);
  });

  it('keeps an order PAID when the command surely did not run', async () => {
    replies = [{ success: false, message: 'Bridge not connected', uncertain: false }];
    const o = order();
    await deliver(o);
    expect(o.status).toBe(OrderStatus.PAID);
    expect(saved).toHaveLength(1);
  });

  it('fails an order whose command may have run', async () => {
    replies = [{ success: false, message: 'Request timed out', uncertain: true }];
    const o = order();
    await deliver(o);
    expect(o.status).toBe(OrderStatus.FAILED);
  });

  it('retries a stuck PAID order and delivers it', async () => {
    stored = [order()];
    replies = [{ success: true, message: 'OK', uncertain: false }];
    await service.retryUndelivered();
    expect(stored[0].status).toBe(OrderStatus.DELIVERED);
  });

  it('gives up after a day', async () => {
    stored = [order({ createdAt: new Date(Date.now() - 25 * 60 * MINUTE) })];
    await service.retryUndelivered();
    expect(stored[0].status).toBe(OrderStatus.FAILED);
  });
});
