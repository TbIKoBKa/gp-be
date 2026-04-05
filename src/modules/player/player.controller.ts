import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags } from '@nestjs/swagger';

import { PlayerService } from './player.service';
import { PlayerSearchDto } from './dto';
import { PaginationInterceptor } from '../../utils';

@ApiTags('players')
@Controller('/players')
@UseInterceptors(CacheInterceptor)
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('/')
  @UseInterceptors(PaginationInterceptor)
  public search(@Query() dto: PlayerSearchDto) {
    return this.playerService.search(dto);
  }

  @Get('/random')
  public getRandom() {
    return this.playerService.getRandom();
  }
}
