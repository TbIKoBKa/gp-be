import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

import { ICallbackOrderDto } from '../interfaces';

export class CallbackOrderDto implements ICallbackOrderDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public InvId?: string;

  @ApiProperty({ type: 'number' })
  @IsNumber()
  @IsOptional()
  public OutSum?: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public custom?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public CurrencyIn?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public SignatureValue?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_co_id?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_pm_no?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_desc?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_payment_method?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_payment_currency?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_am?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_cur?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_act?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_x_nickname?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_sign?: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  public ik_inv_st?: string;
}
