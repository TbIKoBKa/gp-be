import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class VoteHandlerDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  nick: string;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  time: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  sign: string;
}
