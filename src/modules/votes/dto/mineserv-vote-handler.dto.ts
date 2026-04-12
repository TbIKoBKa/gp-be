import { ApiProperty } from '@nestjs/swagger';

export class MineservVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  project: string;

  @ApiProperty({ type: 'string' })
  username: string;

  @ApiProperty({ type: 'string' })
  timestamp: string;

  @ApiProperty({ type: 'string' })
  signature: string;
}
