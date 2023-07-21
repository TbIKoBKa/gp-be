import { Body, Controller, Post, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { BuyDto, CompleteOrderDto, GetClientTokenDto } from './dto';

@ApiTags('orders')
@Controller('/orders')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  // @Get('/')
  // @UseInterceptors(PaginationInterceptor)
  // public search(): Promise<[Array<OrderEntity>, number]> {
  //   return this.orderService.search();
  // }

  @Post('/buy/:id')
  public buy(@Param('id') id: number, @Body() body: BuyDto) {
    return this.orderService.buy(id, body);
  }

  @Post('/complete-order')
  public completeOrder(@Body() body: CompleteOrderDto) {
    return this.orderService.completeOrder(body);
  }

  @Post('/get-client-token')
  public getClientToken(@Body() body: GetClientTokenDto) {
    return this.orderService.getClientToken(body);
  }
}
