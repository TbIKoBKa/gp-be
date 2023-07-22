import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';
import {
  BuyPeriodType,
  CurrencyType,
  LanguageType,
} from '../../../common/types';

import { IBuyDto } from '../interfaces';

export class BuyDto implements IBuyDto {
  @IsString()
  @ApiProperty({ type: 'string' })
  @IsString({
    message: 'Value should be string',
  })
  public nickname: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  public period: BuyPeriodType;

  @ApiProperty({ enum: CurrencyType, enumName: 'Currency' })
  @IsString()
  public currency: CurrencyType;

  @ApiProperty({ enum: LanguageType, enumName: 'Language' })
  @IsString()
  public language: LanguageType;

  @ApiProperty({ type: 'array' })
  @IsArray()
  public args: (string | number)[];

  @IsString()
  @ApiProperty({ type: 'string' })
  @IsString({
    message: 'Value should be string',
  })
  public orderId: string;
}
