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
import { ApiTags } from '@nestjs/swagger';

import { VotesService } from './votes.service';
import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto';
import { McMonitorVoteHandlerDto } from './dto/mcmonitor-vote-handler.dto';
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
  getGlobalStats() {
    return this.votesService.getGlobalStats();
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

  @Post('handler/hot-mc')
  hotMcHandler(@Body() voteHandlerDto: HotmcVoteHandlerDto) {
    return this.votesService.hotMcHandler(voteHandlerDto);
  }

  @Post('handler/mineserv')
  @HttpCode(HttpStatus.OK)
  mineservHandler(@Body() voteHandlerDto: MineservVoteHandlerDto) {
    return this.votesService.mineservHandler(voteHandlerDto);
  }

  @Post('handler/mc-monitor')
  @HttpCode(HttpStatus.OK)
  mcMonitorHandler(@Body() voteHandlerDto: McMonitorVoteHandlerDto) {
    return this.votesService.mcMonitorHandler(voteHandlerDto);
  }

}
