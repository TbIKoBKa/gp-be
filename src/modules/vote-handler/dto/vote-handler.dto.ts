import { IsNumber, IsString } from 'class-validator';

export class VoteHandlerDto {
  @IsString()
  nick: string;

  @IsNumber()
  time: number;

  @IsString()
  sign: string;
}
