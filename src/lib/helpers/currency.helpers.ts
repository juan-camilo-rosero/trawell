const EXCHANGE_RATES: Record<string, number> = {
  USD_TO_COP: 3800,
  EUR_TO_COP: 4450,
};

export function convertToCOP(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'COP') {
    return amount;
  }

  const rate = EXCHANGE_RATES[`${fromCurrency}_TO_COP`];
  
  if (!rate) {
    console.warn(`No se encontró tasa de cambio para ${fromCurrency}, usando valor original`);
    return amount;
  }

  return Math.round(amount * rate);
}

export function convertFromCOP(amount: number, toCurrency: string): number {
  if (toCurrency === 'COP') {
    return amount;
  }

  const rate = EXCHANGE_RATES[`${toCurrency}_TO_COP`];
  
  if (!rate) {
    console.warn(`No se encontró tasa de cambio para ${toCurrency}, usando valor original`);
    return amount;
  }

  return Math.round(amount / rate);
}