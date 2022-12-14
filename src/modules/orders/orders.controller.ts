import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from "@nestjs/common";

import { OrdersService } from "./orders.service";
import { OrderEntity } from "./orders.entity";
import { PaginationInterceptor } from "../../utils";
import { CallbackOrderDto } from "./dto";

@Controller("/orders")
export class OrdersController {
  constructor(
    private readonly orderService: OrdersService,
  ) {}

  @Get("/")
  @UseInterceptors(PaginationInterceptor)
  public search(): Promise<[Array<OrderEntity>, number]> {
    return this.orderService.search();
  }

  @Post('/callback')
  public callback(@Body() body: CallbackOrderDto) {
    return this.orderService.callback(body);
  }
}
