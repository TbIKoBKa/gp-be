import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class PlayerSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Value should be string' })
  public nickname: string;
}
