import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { ICallbackOrderDto } from '../interfaces';

export class CallbackOrderDto implements ICallbackOrderDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  public data: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  public signature: string;
}
