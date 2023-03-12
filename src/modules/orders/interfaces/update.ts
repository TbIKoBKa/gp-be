export interface ICallbackOrderDto {
  // Paypalych
  InvId?: string;
  OutSum?: number;
  custom?: string;
  CurrencyIn?: string;
  SignatureValue?: string;
  // Interkassa
  ik_co_id?: string;
  ik_pm_no?: string;
  ik_desc?: string;
  ik_payment_method?: string;
  ik_payment_currency?: string;
  ik_am?: string;
  ik_cur?: string;
  ik_act?: string;
  ik_x_nickname?: string;
  ik_sign?: string;
  ik_inv_st?: string;
}
