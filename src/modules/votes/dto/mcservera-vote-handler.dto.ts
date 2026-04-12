import { ApiProperty } from '@nestjs/swagger';

export class McServeraVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  name: string;

  @ApiProperty({ type: 'string' })
  id: string;

  @ApiProperty({ type: 'string' })
  sign: string;

  @ApiProperty({ type: 'string' })
  sandbox: string;
}
