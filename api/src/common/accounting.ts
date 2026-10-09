export const ACCOUNTING_ACCOUNT_TYPES = {
  user: 'user',
  bank: 'bank',
  provider: 'provider',
  cash_account: 'cash_account',
  client: 'client',
} as const;

export type AccountingAccountType = keyof typeof ACCOUNTING_ACCOUNT_TYPES;
