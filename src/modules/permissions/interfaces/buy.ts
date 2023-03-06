import {
  BuyPeriodType,
  CurrencyType,
  LanguageType,
} from '../../../common/types';

export interface IPermissionBuyDto {
  nickname: string;
  period: BuyPeriodType;
  currency: CurrencyType;
  language: LanguageType;
}

export interface IPermissionBuyResponseDto {
  data?: string;
  signature?: string;
  success?: boolean;
  link_url?: string;
  link_page_url?: string;
  bill_id?: string;
}
