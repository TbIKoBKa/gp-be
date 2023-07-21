import {
  BuyPeriodType,
  CurrencyType,
  LanguageType,
} from '../../../common/types';

export interface IBuyDto {
  nickname: string;
  period: BuyPeriodType;
  currency: CurrencyType;
  language: LanguageType;
  orderId: string;
  arguments?: (string | number)[];
}

export interface IPermissionBuyResponseDto {
  data?: string;
  signature?: string;
  success?: boolean;
  link_url?: string;
  link_page_url?: string;
  bill_id?: string;
}
