import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";
import { BuyPeriodType, CurrencyType, LanguageType } from "../../../common/types";

import { IPermissionBuyDto } from '../interfaces';

export class PermissionBuyDto implements IPermissionBuyDto {
  @IsString()
  @ApiProperty({ type: 'string' })
  @IsString({
    message: 'Value should be string',
  })
  public nickname: string;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  public period: BuyPeriodType;

  @ApiProperty({ enum: CurrencyType, enumName: 'Currency' })
  @IsString()
  public currency: CurrencyType;

  @ApiProperty({ enum: LanguageType, enumName: 'Language' })
  @IsString()
  public language: LanguageType;
}
