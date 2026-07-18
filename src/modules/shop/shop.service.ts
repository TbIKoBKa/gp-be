import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac } from 'crypto';

import { OrderEntity, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, Currency } from './dto/create-order.dto';
import { catalog, findVariant } from './catalog';
import { BridgeService } from '../bridge/bridge.service';
import { CurrencyService } from '../currency/currency.service';
import { VoteBalanceEntity } from '../votes/entities/vote-balance.entity';
import { SettingsService, SettingKey } from '../settings/settings.service';

const PLISIO_API = 'https://api.plisio.net/api/v1';

// Plisio invoice lifecycle statuses (POST callback `status` field).
const PLISIO_PAID = ['completed', 'mismatch']; // mismatch = paid, but not the exact amount
const PLISIO_FAILED = ['expired', 'cancelled', 'error'];

interface PlisioInvoiceResponse {
  status: 'success' | 'error';
  data?: { txn_id?: string; invoice_url?: string };
}

const LAVA_API = 'https://gate.lava.top/api/v2';

interface LavaInvoiceResponse {
  id: string;
  status?: string;
  paymentUrl?: string;
}

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(VoteBalanceEntity)
    private readonly voteBalanceRepository: Repository<VoteBalanceEntity>,
    private readonly configService: ConfigService,
    private readonly bridgeService: BridgeService,
    private readonly currencyService: CurrencyService,
    private readonly settingsService: SettingsService,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
  ) {}

  getProducts() {
    return catalog.map(({ id, type, server, name, image, description, variants }) => ({
      id,
      type,
      server,
      name,
      image,
      description,
      variants: variants.map(({ id: vid, label, price }) => ({ id: vid, label, price })),
    }));
  }

  async createOrder(dto: CreateOrderDto, authenticatedNickname?: string) {
    const found = findVariant(dto.variantId);
    if (!found) throw new BadRequestException('Unknown variant');

    const { product, variant } = found;
    const currency: Currency = dto.currency || 'RUB';

    if (currency === 'GOCOIN') {
      return this.createGocoinOrder(dto, product, variant, authenticatedNickname);
    }

    if (dto.paymentMethod === 'crypto') {
      return this.createPlisioOrder(dto, product, variant, currency);
    }

    // Default card provider for fiat orders: Lava.top (RU + international cards).
    return this.createLavaOrder(dto, product, variant, currency);
  }

  private async createGocoinOrder(
    dto: CreateOrderDto,
    product: { server: string; name: string },
    variant: { id: string; label: string; price: number; commands: string[] },
    authenticatedNickname?: string,
  ) {
    if (!authenticatedNickname) {
      throw new BadRequestException('Authentication required for GoCoin payment');
    }

    const rate = await this.settingsService.getNumber(SettingKey.GOCOIN_TO_RUB_RATE);
    const gocoinsNeeded = Math.ceil(variant.price / rate);

    // Use authenticated user's balance, but deliver to target player
    const payerNickname = authenticatedNickname.toLowerCase();

    const order = await this.dataSource.transaction(async (manager) => {
      const balance = await manager.findOne(VoteBalanceEntity, {
        where: { nickname: payerNickname },
      });

      if (!balance || balance.balance < gocoinsNeeded) {
        throw new BadRequestException(
          `Insufficient GoCoin balance. Need ${gocoinsNeeded}, have ${balance?.balance ?? 0}`,
        );
      }

      await manager.decrement(VoteBalanceEntity, { nickname: payerNickname }, 'balance', gocoinsNeeded);

      const now = new Date();
      const newOrder = await manager.save(OrderEntity, {
        playerName: dto.playerName,
        server: product.server,
        variantId: variant.id,
        productName: product.name,
        variantLabel: variant.label,
        amount: gocoinsNeeded,
        currency: 'GOCOIN',
        status: OrderStatus.PAID,
        createdAt: now,
        updatedAt: now,
      });

      return newOrder;
    });

    console.log('🚀 ~ ShopService ~ createGocoinOrder ~ order:', order)
    await this.deliverOrder(order);

    return {
      orderId: order.id,
      paymentUrl: null,
    };
  }

  private async createPlisioOrder(
    dto: CreateOrderDto,
    product: { server: string; name: string },
    variant: { id: string; label: string; price: number },
    currency: Exclude<Currency, 'GOCOIN'>,
  ) {
    const convertedAmount = await this.currencyService.convert(variant.price, 'RUB', currency);

    const now = new Date();
    const order = await this.orderRepository.save({
      playerName: dto.playerName,
      server: product.server,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label,
      amount: convertedAmount,
      currency,
      paymentMethod: 'plisio',
      createdAt: now,
      updatedAt: now,
    });

    const secretKey = this.configService.get<string>('PLISIO_SECRET_KEY');
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    const feUrl = this.configService.get<string>('FE_URL');
    const amount = convertedAmount.toFixed(2);

    // Non-PHP integrations MUST append `?json=true` so the callback is JSON
    // (and verify_hash is computed over json_encode instead of PHP serialize).
    const params = {
      api_key: secretKey,
      order_number: String(order.id),
      order_name: `${product.name} — ${variant.label}`,
      source_currency: currency,
      source_amount: amount,
      callback_url: `${backendUrl}/shop/webhook/plisio?json=true`,
      success_callback_url: `${feUrl}/shop/success?order=${order.id}`,
      fail_callback_url: `${feUrl}/shop/fail?order=${order.id}`,
      email: '',
    };

    let invoice: PlisioInvoiceResponse | undefined;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<PlisioInvoiceResponse>(`${PLISIO_API}/invoices/new`, { params }),
      );
      invoice = data;
    } catch (err) {
      this.logger.error(`Plisio request failed for order ${order.id}: ${(err as Error).message}`);
    }

    if (invoice?.status !== 'success' || !invoice.data?.invoice_url) {
      order.status = OrderStatus.FAILED;
      order.updatedAt = new Date();
      await this.orderRepository.save(order);
      throw new BadRequestException('Failed to create crypto invoice');
    }

    if (invoice.data.txn_id) {
      order.providerTxnId = invoice.data.txn_id;
    }
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      paymentUrl: invoice.data.invoice_url,
    };
  }

  private async createLavaOrder(
    dto: CreateOrderDto,
    product: { server: string; name: string },
    variant: { id: string; label: string; price: number },
    currency: Exclude<Currency, 'GOCOIN'>,
  ) {
    const apiKey = this.configService.get<string>('LAVA_API_KEY');
    const offerId = this.configService.get<string>('LAVA_OFFER_ID');
    if (!apiKey || !offerId) {
      throw new BadRequestException('Lava.top is not configured');
    }

    // Lava.top invoices settle in RUB/USD/EUR only — map UAH to USD.
    const lavaCurrency: 'RUB' | 'USD' = currency === 'RUB' ? 'RUB' : 'USD';
    const convertedAmount = await this.currencyService.convert(variant.price, 'RUB', lavaCurrency);

    const now = new Date();
    const order = await this.orderRepository.save({
      playerName: dto.playerName,
      server: product.server,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label,
      amount: convertedAmount,
      currency: lavaCurrency,
      paymentMethod: 'lava',
      createdAt: now,
      updatedAt: now,
    });

    // `amount` is honoured only for offers published as "Цена по запросу через API"
    // (custom price) — keeps the catalog the single source of truth for pricing.
    const payload = {
      email: `order-${order.id}@goplay.pay`,
      offerId,
      currency: lavaCurrency,
      amount: Number(convertedAmount.toFixed(2)),
      buyerLanguage: 'RU',
    };

    let invoice: LavaInvoiceResponse | undefined;
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<LavaInvoiceResponse>(`${LAVA_API}/invoice`, payload, {
          headers: { 'X-Api-Key': apiKey },
        }),
      );
      invoice = data;
    } catch (err) {
      this.logger.error(`Lava.top request failed for order ${order.id}: ${(err as Error).message}`);
    }

    if (!invoice?.paymentUrl) {
      order.status = OrderStatus.FAILED;
      order.updatedAt = new Date();
      await this.orderRepository.save(order);
      throw new BadRequestException('Failed to create card invoice');
    }

    // Lava returns the contract id here; the webhook references it as `contractId`.
    order.providerTxnId = invoice.id;
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      paymentUrl: invoice.paymentUrl,
    };
  }

  async getRates() {
    return this.currencyService.getRates();
  }

  async getOrder(id: number) {
    return this.orderRepository.findOne({ where: { id } });
  }

  async getStats() {
    const count = await this.orderRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });
    return { transactionsCount: count };
  }

  async handlePlisioWebhook(body: Record<string, string>) {
    const secretKey = this.configService.get<string>('PLISIO_SECRET_KEY');

    if (!secretKey || !this.verifyPlisioHash(body, secretKey)) {
      this.logger.warn(`Invalid Plisio webhook signature for order ${body.order_number}`);
      throw new ForbiddenException('Invalid signature');
    }

    const orderId = parseInt(body.order_number, 10);
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found (Plisio webhook)`);
      throw new BadRequestException('Order not found');
    }

    const status = body.status;

    if (PLISIO_FAILED.includes(status)) {
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.FAILED;
        order.updatedAt = new Date();
        await this.orderRepository.save(order);
      }
      return 'ok';
    }

    // Ignore intermediate statuses (new/pending) — wait for a terminal one.
    if (!PLISIO_PAID.includes(status)) {
      return 'ok';
    }

    // Validate the fiat side of the invoice against our order.
    if (body.source_currency && body.source_currency !== order.currency) {
      this.logger.warn(
        `Plisio currency mismatch for order ${orderId}: expected ${order.currency}, got ${body.source_currency}`,
      );
      return 'ok';
    }

    // Guard against underpayment ('mismatch' can mean paid less than requested).
    const paidAmount = parseFloat(body.source_amount);
    const expectedAmount = Number(order.amount);
    if (!Number.isNaN(paidAmount) && paidAmount + 0.01 < expectedAmount) {
      this.logger.warn(
        `Plisio underpayment for order ${orderId}: expected ${expectedAmount}, got ${paidAmount}`,
      );
      return 'ok';
    }

    if (order.status !== OrderStatus.PENDING) {
      return 'ok';
    }

    order.status = OrderStatus.PAID;
    if (body.txn_id) {
      order.providerTxnId = body.txn_id;
    }
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    await this.deliverOrder(order);

    return 'ok';
  }

  // Plisio json=true callbacks: verify_hash = HMAC-SHA1( json_encode(body without
  // verify_hash), SECRET_KEY ). Key order must match what Plisio sent, so we strip
  // verify_hash in place and re-stringify the remaining fields as received.
  private verifyPlisioHash(body: Record<string, string>, secretKey: string): boolean {
    const verifyHash = body.verify_hash;
    if (!verifyHash) return false;

    const data = { ...body };
    delete data.verify_hash;

    const expected = createHmac('sha1', secretKey)
      .update(JSON.stringify(data))
      .digest('hex');

    return expected === verifyHash;
  }

  // Lava.top webhooks are authenticated by a shared secret sent in the X-Api-Key
  // header (configured as the webhook's "API key" auth) — not an HMAC signature.
  async handleLavaWebhook(apiKey: string | undefined, body: Record<string, any>) {
    const secret = this.configService.get<string>('LAVA_WEBHOOK_SECRET');

    if (!secret || apiKey !== secret) {
      this.logger.warn(`Invalid Lava.top webhook auth for contract ${body?.contractId}`);
      throw new ForbiddenException('Invalid webhook auth');
    }

    const eventType = body.eventType;

    // Only one-time payment events matter here (ignore subscription/recurring).
    if (eventType !== 'payment.success' && eventType !== 'payment.failed') {
      return 'OK';
    }

    const contractId = body.contractId;
    if (!contractId) {
      throw new BadRequestException('Missing contractId');
    }

    const order = await this.orderRepository.findOne({ where: { providerTxnId: contractId } });
    if (!order) {
      this.logger.warn(`Order for Lava.top contract ${contractId} not found`);
      throw new BadRequestException('Order not found');
    }

    if (eventType === 'payment.failed') {
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.FAILED;
        order.updatedAt = new Date();
        await this.orderRepository.save(order);
      }
      return 'OK';
    }

    // payment.success — validate the amount/currency against our order.
    if (body.currency && body.currency !== order.currency) {
      this.logger.warn(
        `Lava.top currency mismatch for order ${order.id}: expected ${order.currency}, got ${body.currency}`,
      );
      return 'OK';
    }

    const paidAmount = Number(body.amount);
    const expectedAmount = Number(order.amount);
    if (!Number.isNaN(paidAmount) && paidAmount + 0.01 < expectedAmount) {
      this.logger.warn(
        `Lava.top underpayment for order ${order.id}: expected ${expectedAmount}, got ${paidAmount}`,
      );
      return 'OK';
    }

    if (order.status !== OrderStatus.PENDING) {
      return 'OK';
    }

    order.status = OrderStatus.PAID;
    order.updatedAt = new Date();
    await this.orderRepository.save(order);

    await this.deliverOrder(order);

    return 'OK';
  }

  private async deliverOrder(order: OrderEntity) {
    const found = findVariant(order.variantId);
    if (!found) {
      this.logger.error(`Variant ${order.variantId} not found for order ${order.id}`);
      order.status = OrderStatus.FAILED;
      order.updatedAt = new Date();
      await this.orderRepository.save(order);
      return;
    }

    const { variant } = found;

    for (const cmdTemplate of variant.commands) {
      const command = cmdTemplate.replace(/{player}/g, order.playerName);
      const result = await this.bridgeService.execute(order.server, command);
      if (!result.success) {
        this.logger.error(`Command failed for order ${order.id}: ${result.message}`);
        order.status = OrderStatus.FAILED;
        order.updatedAt = new Date();
        await this.orderRepository.save(order);
        return;
      }
    }

    order.status = OrderStatus.DELIVERED;
    order.updatedAt = new Date();
    await this.orderRepository.save(order);
    this.logger.log(`Order ${order.id} delivered to ${order.playerName}`);
  }
}
