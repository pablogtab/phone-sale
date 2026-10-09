export interface Order {
    id: number;
    publicId: string;
    status: OrderStatus;
    clientId: number;
    exchangeRate: number;
    type: 'faceid' | 'sale' | 'wholesale';
    deliveredByUserId: number;
}

export interface OrderPayment {}

export const ORDER_STATUSES = {
    pending: 'Pendiente',
    confirmed: 'Completada',
    cancelled: 'Cancelada',
    deposited: 'Señada',
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export const ORDER_PAYMENT_METHODS = {
    bank_transfer: 'Transferencia',
    cash: 'Efectivo',
    device: 'Entrega Equipo',
} as const;

export type OrderPaymentMethod = keyof typeof ORDER_PAYMENT_METHODS;

export interface OrderItem {
    id: number;
    exchangeRate: number;
    quantity: number;
    priceUSD: number;
    priceARS: number;
    discount: number;
    total: number;
    isWholesale: boolean;
    orderId: number;
    productId: number;
    createdAt: string;
}

export interface OrderPayment {
    id: number;
    publicId: string;
    exchangeRate: number;
    amountUSD: number;
    amountARS: number;
    method: OrderPaymentMethod;
    description: string;
    isDeposit: boolean;
    orderId: number;
    transactionId: number;
    deviceId?: number;
    createdAt: string;
}
