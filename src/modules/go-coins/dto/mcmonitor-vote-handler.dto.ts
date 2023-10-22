import { ApiProperty } from '@nestjs/swagger';
// import { IsNumber, IsString } from 'class-validator';

export class McMonitorVoteHandlerDto {
  @ApiProperty({ type: 'string' })
  // @IsString()
  name: string;

  @ApiProperty({ type: 'string' })
  // @IsNumber()
  id: string;

  @ApiProperty({ type: 'string' })
  // @IsString()
  sign: string;

  @ApiProperty({ type: 'string' })
  // @IsString()
  sandbox: string;
}
