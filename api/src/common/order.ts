export const ORDER_STATUSES = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  deposited: 'deposited',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export const ORDER_PAYMENT_METHODS = {
  bank_transfer: 'bank_transfer',
  cash: 'cash',
  device: 'device',
} as const;

export type OrderPaymentMethod = keyof typeof ORDER_PAYMENT_METHODS;

export const ORDER_TYPES = {
  sale: 'sale',
  faceid: 'faceid',
  wholesale: 'wholesale',
} as const;

export type OrderType = keyof typeof ORDER_TYPES;
