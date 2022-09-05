import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

import { IPlayerSearchDto } from '../interfaces';

export class PlayerSearchDto implements IPlayerSearchDto {
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
