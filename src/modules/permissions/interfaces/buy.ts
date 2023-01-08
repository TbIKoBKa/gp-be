import { BuyPeriodType, CurrencyType } from "../../../common/types";

export interface IPermissionBuyDto {
  nickname: string;
  period: BuyPeriodType;
  currency: CurrencyType;
}

export interface IPermissionBuyResponseDto {
  data: string;
  signature: string;
}
