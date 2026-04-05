import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  @Matches(/^[a-zA-Z0-9_]+$/)
  playerName: string;

  @IsString()
  @IsNotEmpty()
  variantId: string;
}
