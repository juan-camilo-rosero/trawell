const EXCHANGE_RATES: Record<string, number> = {
  COP_TO_USD: 0.00025,
  EUR_TO_USD: 1.05,
};

export function convertToUSD(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'USD') {
    return amount;
  }

  const rate = EXCHANGE_RATES[`${fromCurrency}_TO_USD`];
  
  if (!rate) {
    console.warn(`No exchange rate found for ${fromCurrency}, using original value`);
    return amount;
  }

  return Math.round(amount * rate);
}

export function convertFromUSD(amount: number, toCurrency: string): number {
  if (toCurrency === 'USD') {
    return amount;
  }

  const rate = EXCHANGE_RATES[`${toCurrency}_TO_USD`];
  
  if (!rate) {
    console.warn(`No exchange rate found for ${toCurrency}, using original value`);
    return amount;
  }

  return Math.round(amount / rate);
}

export function convertToCOP(amount: number, fromCurrency: string): number {
  const amountInUSD = convertToUSD(amount, fromCurrency);
  return convertFromUSD(amountInUSD, 'COP');
}