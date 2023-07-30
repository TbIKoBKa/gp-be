import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { IPlayerSearchDto } from '../interfaces';

export class PlayerSearchDto implements IPlayerSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({
    message: 'Value should be string',
  })
  public nickname: string;
}
