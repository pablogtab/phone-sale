export const PUBLIC_PARAMETER_KEYS = {
    dolar_hoy_cba_price: 'dolar_hoy_cba_price',
    order_roundings_account_id: 'order_roundings_account_id',
} as const;

export type PublicParameterKey = keyof typeof PUBLIC_PARAMETER_KEYS;

export interface Parameter {
    key: PublicParameterKey;
    valueS?: string;
    valueN?: number;
    valueB?: boolean;
    valueJ?: object;
    createdAt: string;
    updatedAt: string;
}
