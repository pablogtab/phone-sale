export const CURRENCIES = {
    usd: 'usd',
    ars: 'ars',
} as const;

export type Currency = keyof typeof CURRENCIES;
