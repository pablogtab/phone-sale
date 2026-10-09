export const PARAMETERS_KEYS = {
  dolar_hoy_cba_price: 'dolar_hoy_cba_price',
  order_roundings_account_id: 'order_roundings_account_id',
  taken_provider_id: 'taken_provider_id',
} as const;

export type ParameterKey = keyof typeof PARAMETERS_KEYS;
