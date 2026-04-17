import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export type Currency = 'RUB' | 'UAH' | 'USD';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9_]+$/)
  playerName: string;

  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsString()
  @IsIn(['RUB', 'UAH', 'USD'])
  @IsOptional()
  currency?: Currency;
}
