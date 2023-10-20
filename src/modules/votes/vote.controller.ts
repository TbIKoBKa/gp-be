import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VotesService } from './votes.service';
import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { McMonitorVoteHandlerDto } from './dto/mcmonitor-vote-handler.dto';
import { FormDataRequest } from 'nestjs-form-data';
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

  @Get(':nickname')
  @UseInterceptors(PaginationInterceptor)
  getVoteByNickname(@Param('nickname') nickname: string) {
    return this.votesService.getVoteByNickname(nickname);
  }

  @Post('handler/hot-mc')
  @FormDataRequest()
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
