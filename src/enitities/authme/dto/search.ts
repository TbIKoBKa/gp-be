import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

import { IAuthMeSearchDto } from '../interfaces';

export class AuthMeSearchDto implements IAuthMeSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({
    message: 'Value should be string',
  })
  public username: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({
    message: 'Value should be string',
  })
  public realname: string;
}
