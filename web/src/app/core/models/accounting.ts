export const ACCOUNTING_ACCOUNT_TYPES = {
    user: 'user',
    provider: 'provider',
    client: 'client',
    bank: 'bank',
    cash_account: 'cash_account',
} as const;

export type AccountingConfig = {
    key: string;
    label: string;
    isAsset: boolean;
    value: string;
};

export const ACCOUNTING_TYPES_CONFIG: Record<
    AccountingAccountType,
    AccountingConfig
> = {
    user: {
        key: 'userId',
        label: 'Usuario',
        isAsset: false,
        value: 'user',
    },
    provider: {
        key: 'providerId',
        label: 'Proveedor',
        isAsset: false,
        value: 'provider',
    },
    client: {
        key: 'clientId',
        label: 'Cliente',
        isAsset: false,
        value: 'client',
    },
    cash_account: {
        key: 'cashAccountId',
        label: 'Caja',
        isAsset: true,
        value: 'cash_account',
    },
    bank: {
        key: 'bankId',
        label: 'Banco',
        isAsset: true,
        value: 'bank',
    },
};

export type AccountingAccountType = keyof typeof ACCOUNTING_ACCOUNT_TYPES;

export interface AccountingAccount {
    id: number;
    name: string;
    type: AccountingAccountType;
    balance: number;
    currency: 'usd' | 'ars';
    providerId?: number;
    clientId?: number;
    userId?: number;
    bankId?: number;
    cashAccountId?: number;
    isAsset: boolean; //true is an asset account, false is a passive account
}

export interface AccountingTransaction {
    accountingAccountId: number;
    amount: number;
    createdAt: string;
    date: string;
    eventId: number;
    description: string;
}
