import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CompleteOrderDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  order_id: string;
}
