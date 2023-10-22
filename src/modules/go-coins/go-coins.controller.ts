import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GoCoinsService } from './go-coins.service';
import { PaginationInterceptor } from '../../utils';

@ApiTags('go-coins')
@Controller('go-coins')
export class GoCoinsController {
  constructor(private readonly goCoinsService: GoCoinsService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  getVotes() {
    return this.goCoinsService.getGoCoins({});
  }

  @Get(':nickname')
  @UseInterceptors(PaginationInterceptor)
  getVoteByNickname(@Param('nickname') nickname: string) {
    return this.goCoinsService.getGoCoinsByNickname(nickname);
  }
}
