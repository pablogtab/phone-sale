export type Currency = {
  symbol: string;
  label: string;
};

export const CURRENCIES = {
  usd: {
    symbol: 'U$D',
    label: 'USD',
  },
  ars: {
    symbol: '$',
    label: 'EUR',
  },
} as const;

export type CurrencyType = keyof typeof CURRENCIES;
