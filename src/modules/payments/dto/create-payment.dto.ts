import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ type: String })
  @IsString({
    message: 'Value should be string',
  })
  public customer: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  public server_id: number;

  @ApiProperty({ type: [Number] })
  @IsArray()
  public products: number[];
}
