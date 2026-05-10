import { Controller, Get, Post, Put, Body, UseGuards, Query } from '@nestjs/common';

import { JwtAuthGuard, AdminJwtGuard } from '../../common/guards';
import { CurrentUser, UserPayload } from '../../common/decorators';
import { LuckService, PrizeWeights } from './luck.service';

@Controller('luck')
export class LuckController {
  constructor(private readonly luckService: LuckService) {}

  @Get('config')
  getConfig() {
    return this.luckService.getConfig();
  }

  @Post('spin')
  @UseGuards(JwtAuthGuard)
  spin(@CurrentUser() user: UserPayload) {
    return this.luckService.spin(user.nickname);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.luckService.getHistory(
      user.nickname,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('global-history')
  getGlobalHistory(@Query('limit') limit?: string) {
    return this.luckService.getGlobalHistory(limit ? parseInt(limit, 10) : 15);
  }

  @Get('weights')
  @UseGuards(AdminJwtGuard)
  getPrizeWeights() {
    return this.luckService.getPrizeWeights();
  }

  @Put('weights')
  @UseGuards(AdminJwtGuard)
  updatePrizeWeights(@Body() weights: PrizeWeights) {
    return this.luckService.updatePrizeWeights(weights);
  }
}
