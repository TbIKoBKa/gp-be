import { ApiProperty } from '@nestjs/swagger';

export class TmonitoringVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  hash: string;

  @ApiProperty({ type: 'number' })
  id: number;
}
