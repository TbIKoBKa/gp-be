import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

import { OrderEntity, OrderStatus } from '../shop/entities/order.entity';
import { VoteEntity } from '../votes/entities/vote.entity';
import { VoteBalanceEntity } from '../votes/entities/vote-balance.entity';
import { LimboAuthPlayer } from '../auth/entities/limboauth-player.entity';
import { BridgeService } from '../bridge/bridge.service';
import { findVariant } from '../shop/catalog';

import { GetOrdersDto, ExecuteCommandDto, PaginationDto, GetPlayersDto, GetVotesDto } from './dto';

export interface PaginatedResponse<T> {
  rows: T[];
  count: number;
}

export interface OverviewStats {
  orders: {
    total: number;
    pending: number;
    delivered: number;
    failed: number;
    todayRevenue: number;
  };
  votes: {
    total: number;
    today: number;
  };
  players: {
    total: number;
    activeToday: number;
  };
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(VoteEntity)
    private readonly voteRepository: Repository<VoteEntity>,
    @InjectRepository(VoteBalanceEntity)
    private readonly voteBalanceRepository: Repository<VoteBalanceEntity>,
    @InjectRepository(LimboAuthPlayer, 'minecraft')
    private readonly playerRepository: Repository<LimboAuthPlayer>,
    private readonly bridgeService: BridgeService,
  ) {}

  async getOrders(dto: GetOrdersDto): Promise<PaginatedResponse<OrderEntity>> {
    const { page = 1, limit = 50, status, playerName, dateFrom, dateTo } = dto;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (playerName) {
      where.playerName = Like(`%${playerName}%`);
    }

    if (dateFrom && dateTo) {
      where.createdAt = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      where.createdAt = MoreThanOrEqual(new Date(dateFrom));
    } else if (dateTo) {
      where.createdAt = LessThanOrEqual(new Date(dateTo));
    }

    const [rows, count] = await this.orderRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { rows, count };
  }

  async getOrder(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async redeliverOrder(id: number): Promise<{ success: boolean; message: string }> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.FAILED &&
      order.status !== OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        `Cannot redeliver order with status "${order.status}". Only "paid", "delivered" or "failed" orders can be redelivered.`,
      );
    }

    const found = findVariant(order.variantId);
    if (!found) {
      throw new BadRequestException(`Variant ${order.variantId} not found in catalog`);
    }

    const { variant } = found;

    for (const cmdTemplate of variant.commands) {
      const command = cmdTemplate.replace(/{player}/g, order.playerName);
      const result = await this.bridgeService.execute(order.server, command);

      if (!result.success) {
        this.logger.error(`Redeliver failed for order ${order.id}: ${result.message}`);
        return { success: false, message: result.message };
      }
    }

    order.status = OrderStatus.DELIVERED;
    await this.orderRepository.save(order);

    this.logger.log(`Order ${order.id} redelivered to ${order.playerName}`);
    return { success: true, message: 'Order redelivered successfully' };
  }

  getBridgeStatus(): { connected: boolean } {
    return { connected: this.bridgeService.connected };
  }

  async executeCommand(dto: ExecuteCommandDto): Promise<{ success: boolean; message: string }> {
    const result = await this.bridgeService.execute(dto.server, dto.command);
    return result;
  }

  async getVotes(dto: GetVotesDto): Promise<PaginatedResponse<VoteEntity>> {
    const { page = 1, limit = 50, nickname, source } = dto;

    const where: Record<string, unknown> = {};

    if (nickname) {
      where.nickname = Like(`%${nickname.toLowerCase()}%`);
    }

    if (source) {
      where.source = source;
    }

    const [rows, count] = await this.voteRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { rows, count };
  }

  async getBalances(dto: PaginationDto): Promise<PaginatedResponse<VoteBalanceEntity>> {
    const { page = 1, limit = 50 } = dto;

    const [rows, count] = await this.voteBalanceRepository.findAndCount({
      order: { totalVotes: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { rows, count };
  }

  async getPlayers(dto: GetPlayersDto): Promise<PaginatedResponse<Partial<LimboAuthPlayer>>> {
    const { page = 1, limit = 50, nickname } = dto;

    const qb = this.playerRepository.createQueryBuilder('auth');

    qb.select([
      'auth.nickname',
      'auth.uuid',
      'auth.regDate',
      'auth.loginDate',
      'auth.ip',
      'auth.loginIp',
    ]);

    if (nickname) {
      qb.where('auth.lowercaseNickname LIKE :nick', {
        nick: `%${nickname.toLowerCase()}%`,
      });
    }

    qb.orderBy('auth.regDate', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, count] = await qb.getManyAndCount();

    const sanitizedRows = rows.map((player) => ({
      nickname: player.nickname,
      uuid: player.uuid,
      regDate: player.regDate,
      loginDate: player.loginDate,
      ip: this.maskIp(player.ip),
      loginIp: player.loginIp ? this.maskIp(player.loginIp) : undefined,
    }));

    return { rows: sanitizedRows, count };
  }

  async getOverviewStats(): Promise<OverviewStats> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      failedOrders,
      totalVotes,
      totalPlayers,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ where: { status: OrderStatus.PENDING } }),
      this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } }),
      this.orderRepository.count({ where: { status: OrderStatus.FAILED } }),
      this.voteRepository.count(),
      this.playerRepository.count(),
    ]);

    const todayRevenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.amount)', 'total')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.createdAt >= :todayStart', { todayStart })
      .getRawOne();

    const todayVotes = await this.voteRepository
      .createQueryBuilder('vote')
      .where('vote.createdAt >= :todayStart', { todayStart })
      .getCount();

    const activeTodayResult = await this.playerRepository
      .createQueryBuilder('auth')
      .where('auth.loginDate >= :todayStartMs', { todayStartMs: todayStart.getTime() })
      .getCount();

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        failed: failedOrders,
        todayRevenue: parseFloat(todayRevenueResult?.total || '0'),
      },
      votes: {
        total: totalVotes,
        today: todayVotes,
      },
      players: {
        total: totalPlayers,
        activeToday: activeTodayResult,
      },
    };
  }

  private maskIp(ip: string): string {
    if (!ip) return '';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.***`;
    }
    return ip.slice(0, Math.ceil(ip.length / 2)) + '***';
  }
}
