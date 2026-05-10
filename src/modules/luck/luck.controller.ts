import { Controller, Get, Post, Put, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { LuckService, PrizeWeights } from './luck.service';

interface AuthenticatedRequest extends Request {
  user: { nickname: string; uuid: string };
}

@Controller('luck')
export class LuckController {
  constructor(private readonly luckService: LuckService) {}

  @Get('config')
  getConfig() {
    return this.luckService.getConfig();
  }

  @Post('spin')
  @UseGuards(JwtAuthGuard)
  spin(@Req() req: AuthenticatedRequest) {
    return this.luckService.spin(req.user.nickname);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.luckService.getHistory(
      req.user.nickname,
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
