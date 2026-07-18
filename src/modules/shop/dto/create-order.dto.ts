import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export type Currency = 'RUB' | 'UAH' | 'USD' | 'GOCOIN';

export type PaymentMethod = 'lava' | 'crypto';

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
  @IsIn(['RUB', 'UAH', 'USD', 'GOCOIN'])
  @IsOptional()
  currency?: Currency;

  // 'lava' -> Lava.top (RU + international cards), 'crypto' -> Plisio (USDT/BTC/...).
  // Ignored for GOCOIN. Defaults to 'lava' for fiat orders when omitted.
  @IsString()
  @IsIn(['lava', 'crypto'])
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
