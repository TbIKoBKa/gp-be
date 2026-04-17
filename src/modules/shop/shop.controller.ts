import { Body, Controller, Get, Ip, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';

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
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.getOrder(id);
  }

  @SkipThrottle()
  @Post('webhook')
  handleWebhook(@Ip() ip: string, @Body() body: Record<string, string>) {
    return this.shopService.handleWebhook(ip, body);
  }
}
