import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { IGetClientToken } from '../interfaces';

export class GetClientTokenDto implements IGetClientToken {
  @IsString()
  @ApiProperty({ type: 'string' })
  @IsString({
    message: 'Value should be string',
  })
  @IsOptional()
  customer_id?: string;
}
