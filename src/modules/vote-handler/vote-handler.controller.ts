import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VoteHandlerService } from './vote-handler.service';
import { MineservVoteHandlerDto } from './dto/mineserv-vote-handler.dto';
import { HotmcVoteHandlerDto } from './dto/hotmc-vote-handler.dto copy';
import { Request } from 'express';

@ApiTags('vote')
@Controller('vote-handler')
export class VoteHandlerController {
  constructor(private readonly voteHandlerService: VoteHandlerService) {}

  @Post('hot-mc')
  hotMcHandler(
    @Body() voteHandlerDto: HotmcVoteHandlerDto,
    @Req() req: Request
  ) {
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:11 ~ VoteHandlerController ~ handler ~ voteHandlerDto:',
      voteHandlerDto
    );
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:25 ~ VoteHandlerController ~ hotMcHandlerGet ~ req:',
      req.body,
      req.params
    );
    return this.voteHandlerService.hotMcHandler(voteHandlerDto);
  }

  @Post('mineserv')
  @HttpCode(HttpStatus.OK)
  mineservHandler(@Body() voteHandlerDto: MineservVoteHandlerDto) {
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:11 ~ VoteHandlerController ~ handler ~ voteHandlerDto:',
      voteHandlerDto
    );
    return this.voteHandlerService.mineservHandler(voteHandlerDto);
  }

  @Get('t-monitoring')
  tMonitoringHandler(@Param('id') id: string, @Param('hash') hash: string) {
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
