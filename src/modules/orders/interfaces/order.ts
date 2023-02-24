import { CurrencyType } from '../../../common/types';

export interface IOrder {
  id: number;
  amount: number;
  currency: CurrencyType;
  status: string;
  meta?: any;
  created_at: string;
}
