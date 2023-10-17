import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VoteHandlerService } from './vote-handler.service';
import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { McMonitorVoteHandlerDto } from './dto/mcmonitor-vote-handler.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { Request } from 'express';

@ApiTags('vote')
@Controller('vote-handler')
export class VoteHandlerController {
  constructor(private readonly voteHandlerService: VoteHandlerService) {}

  @Post('hot-mc')
  @FormDataRequest()
  hotMcHandler(@Body() voteHandlerDto: HotmcVoteHandlerDto) {
    return this.voteHandlerService.hotMcHandler(voteHandlerDto);
  }

  @Post('mineserv')
  @HttpCode(HttpStatus.OK)
  mineservHandler(@Body() voteHandlerDto: MineservVoteHandlerDto) {
    return this.voteHandlerService.mineservHandler(voteHandlerDto);
  }

  @Post('mc-monitor')
  @HttpCode(HttpStatus.OK)
  mcMonitorHandler(@Body() voteHandlerDto: McMonitorVoteHandlerDto) {
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:38 ~ VoteHandlerController ~ mcMonitorHandler ~ voteHandlerDto:',
      voteHandlerDto
    );
    return this.voteHandlerService.mcMonitorHandler(voteHandlerDto);
  }

  @Get('t-monitoring')
  tMonitoringHandler(
    @Param('id') id: string,
    @Param('hash') hash: string,
    @Req() req: Request
  ) {
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:53 ~ VoteHandlerController ~ req:',
      req
    );
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:23 ~ VoteHandlerController ~ tMonitoringHandler ~ hash:',
      hash
    );
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:23 ~ VoteHandlerController ~ tMonitoringHandler ~ id:',
      id
    );
    return this.voteHandlerService.tMonitoringHandler(id, hash);
  }
}
