export class SysEvent {
    id: string;
    description: string;
    type: string;
    createdAt: string;
}

export const SYS_EVENT_TYPES = {
    Sale: 'Sale',
    Deposit: 'Deposit',
    Payment: 'Payment',
    Transfer: 'Transfer',
} as const;

export type SysEventType = keyof typeof SYS_EVENT_TYPES;
