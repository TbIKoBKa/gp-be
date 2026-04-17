import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { AdminService } from './admin.service';
import { GetOrdersDto, ExecuteCommandDto, PaginationDto, GetPlayersDto, GetVotesDto } from './dto';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AdminJwtGuard)
@SkipThrottle()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  getOrders(@Query() query: GetOrdersDto) {
    return this.adminService.getOrders(query);
  }

  @Get('orders/:id')
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOrder(id);
  }

  @Post('orders/:id/redeliver')
  redeliverOrder(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.redeliverOrder(id);
  }

  @Get('bridge/status')
  getBridgeStatus() {
    return this.adminService.getBridgeStatus();
  }

  @Post('commands/execute')
  executeCommand(@Body() dto: ExecuteCommandDto) {
    return this.adminService.executeCommand(dto);
  }

  @Get('votes')
  getVotes(@Query() query: GetVotesDto) {
    return this.adminService.getVotes(query);
  }

  @Get('balances')
  getBalances(@Query() query: PaginationDto) {
    return this.adminService.getBalances(query);
  }

  @Get('players')
  getPlayers(@Query() query: GetPlayersDto) {
    return this.adminService.getPlayers(query);
  }

  @Get('stats/overview')
  getOverviewStats() {
    return this.adminService.getOverviewStats();
  }
}
