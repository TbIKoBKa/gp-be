import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class PartnerStatsDto {
  @ApiPropertyOptional({ description: 'Первый день периода по МСК, YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  public from?: string;

  @ApiPropertyOptional({ description: 'Последний день периода по МСК, YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  public to?: string;
}
