import { ApiProperty } from '@nestjs/swagger';

export class HotmcVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  nick: string;

  @ApiProperty({ type: 'number' })
  time: number;

  @ApiProperty({ type: 'string' })
  sign: string;
}
