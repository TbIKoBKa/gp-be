import axios, { AxiosResponse } from 'axios';

export const convertCurrency = async (
  from: string,
  to: string,
  amount: number
): Promise<number> => {
  if (from.includes(to)) {
    return amount;
  }

  return axios
    .get(`https://api.binance.com/api/v3/ticker/price?symbol=${from}${to}`)
    .then((response: AxiosResponse) => {
      return Math.round(+response.data.price * amount);
    });
};
