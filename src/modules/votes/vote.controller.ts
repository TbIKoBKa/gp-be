import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { VotesService } from './votes.service';
import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto';
import { PaginationInterceptor } from '../../utils';

@ApiTags('votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  getVotes() {
    return this.votesService.getVotes({});
  }

  @Get('balance/:nickname')
  getBalance(@Param('nickname') nickname: string) {
    return this.votesService.getBalance(nickname);
  }

  @Get('stats')
  getGlobalStats(@Query('days') days?: number) {
    return this.votesService.getGlobalStats(days ? Number(days) : undefined);
  }

  @Get('stats/:nickname')
  getPlayerStats(
    @Param('nickname') nickname: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.votesService.getPlayerStats(nickname, from, to);
  }

  @Get(':nickname')
  @UseInterceptors(PaginationInterceptor)
  getVoteByNickname(@Param('nickname') nickname: string) {
    return this.votesService.getVoteByNickname(nickname);
  }

  // --- Vote handlers (callbacks from monitoring services) ---

  @SkipThrottle()
  @Post('handler/hot-mc')
  @UseInterceptors(FileInterceptor(''))
  hotMcHandler(@Body() voteHandlerDto: HotmcVoteHandlerDto) {
    return this.votesService.hotMcHandler(voteHandlerDto);
  }

  @SkipThrottle()
  @Post('handler/mineserv')
  @HttpCode(HttpStatus.OK)
  mineservHandler(@Body() voteHandlerDto: MineservVoteHandlerDto) {
    return this.votesService.mineservHandler(voteHandlerDto);
  }

  @SkipThrottle()
  @Get('handler/tmonitoring')
  tmonitoringHandler(
    @Query('hash') hash: string,
    @Query('id') id: number,
  ) {
    return this.votesService.tmonitoringHandler({ hash, id });
  }

}
