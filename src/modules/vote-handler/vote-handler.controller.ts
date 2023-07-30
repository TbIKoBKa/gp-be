import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { VoteHandlerService } from './vote-handler.service';
import { VoteHandlerDto } from './dto/vote-handler.dto';

@ApiTags('vote')
@Controller('vote-handler')
export class VoteHandlerController {
  constructor(private readonly voteHandlerService: VoteHandlerService) {}

  @Post()
  handler(@Body() voteHandlerDto: VoteHandlerDto) {
    console.log(
      '🚀 ~ file: vote-handler.controller.ts:11 ~ VoteHandlerController ~ handler ~ voteHandlerDto:',
      voteHandlerDto
    );
    return this.voteHandlerService.handler(voteHandlerDto);
  }
}
