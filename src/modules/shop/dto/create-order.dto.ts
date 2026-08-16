import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export type Currency = 'RUB' | 'UAH' | 'USD' | 'GOCOIN';

export type PaymentMethod = 'lava' | 'sbp' | 'paypal' | 'applepay' | 'crypto';

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

  // Everything but 'crypto' is a Lava.top rail (see LAVA_METHODS in the service);
  // 'crypto' -> Plisio (USDT/BTC/...). Ignored for GOCOIN. Defaults to 'lava' for fiat.
  @IsString()
  @IsIn(['lava', 'sbp', 'paypal', 'applepay', 'crypto'])
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
