import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { ShopService } from './shop.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../../common/guards';
import { CurrentUser, UserPayload } from '../../common/decorators';

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
  @UseGuards(OptionalJwtAuthGuard)
  createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user?: UserPayload) {
    return this.shopService.createOrder(dto, user?.nickname);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    const order = await this.shopService.getOrder(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.playerName.toLowerCase() !== user.nickname.toLowerCase()) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  @SkipThrottle()
  @Post('webhook/plisio')
  handlePlisioWebhook(@Body() body: Record<string, string>) {
    return this.shopService.handlePlisioWebhook(body);
  }

  @SkipThrottle()
  @Post('webhook/lava')
  handleLavaWebhook(
    @Headers('x-api-key') apiKey: string,
    @Body() body: Record<string, any>,
  ) {
    return this.shopService.handleLavaWebhook(apiKey, body);
  }
}
