import { ApiProperty } from '@nestjs/swagger';
// import { IsNumber, IsString } from 'class-validator';

export class MineservVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  // @IsString()
  project: string;

  @ApiProperty({ type: 'string' })
  // @IsNumber()
  username: string;

  @ApiProperty({ type: 'string' })
  // @IsString()
  timestamp: string;

  @ApiProperty({ type: 'string' })
  // @IsString()
  signature: string;
}
