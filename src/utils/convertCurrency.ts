import CC from 'currency-converter-lt';

export const convertCurrency = async (from: string, to: string, amount: number): Promise<number> => {
  const converter = new CC({ from, to, amount });

  return converter.convert().then((response: number) => {
    return Math.round(response * 100) / 100;
  });
};
