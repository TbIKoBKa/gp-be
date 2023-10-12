import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String })
  @IsString({
    message: 'Value should be string',
  })
  public login: string;

  @ApiProperty({ type: String })
  @IsString({
    message: 'Value should be string',
  })
  public password: string;
}
