import { Controller, Post, Body } from '@nestjs/common';
import { VoteHandlerService } from './vote-handler.service';
import { VoteHandlerDto } from './dto/vote-handler.dto';

@Controller('vote-handler')
export class VoteHandlerController {
  constructor(private readonly voteHandlerService: VoteHandlerService) {}

  @Post()
  create(@Body() voteHandlerDto: VoteHandlerDto) {
    return this.voteHandlerService.handler(voteHandlerDto);
  }
}
