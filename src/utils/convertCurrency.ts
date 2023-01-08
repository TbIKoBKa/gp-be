import CC from 'currency-converter-lt';

export const convertCurrency = async (from: string, to: string, amount: number): Promise<number> => {
  console.log('from', from);
  console.log('to', to);
  console.log('amount', amount);

  const converter = new CC({ from, to, amount });

  return converter.convert().then((response: number) => {
    console.log('response', response);

    return Math.round(response * 100) / 100;
  })
    .catch((error: Error) => {
      console.error(error);
    });
};
