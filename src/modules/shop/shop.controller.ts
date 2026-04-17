import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';

import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt';

interface AuthenticatedRequest extends Request {
  user: { nickname: string; uuid: string };
}

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  getProducts() {
    return this.shopService.getProducts();
  }

  @Get('stats')
  getStats() {
    return this.shopService.getStats();
  }

  @Get('rates')
  getRates() {
    return this.shopService.getRates();
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.shopService.createOrder(dto);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const order = await this.shopService.getOrder(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.playerName.toLowerCase() !== req.user.nickname.toLowerCase()) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  @SkipThrottle()
  @Post('webhook')
  handleWebhook(@Ip() ip: string, @Body() body: Record<string, string>) {
    return this.shopService.handleWebhook(ip, body);
  }
}
