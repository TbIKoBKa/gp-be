import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';

import { PlayerService } from './player.service';
import { PlayerEntity } from './player.entity';
import { PlayerSearchDto } from './dto';
import { PaginationInterceptor } from '../../utils';

@Controller('/players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('/')
  @UseInterceptors(PaginationInterceptor)
  public search(
    @Query() dto: PlayerSearchDto
  ): Promise<[Array<PlayerEntity>, number]> {
    return this.playerService.search(dto);
  }
}
