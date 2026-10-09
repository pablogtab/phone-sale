export const EVENT_TYPES = {
  Sale: 'Sale',
  Deposit: 'Deposit',
  Payment: 'Payment',
  Transfer: 'Transfer',
  Purchase: 'Purchase',
  Service_Payment: 'Service_Payment',
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export class CreateEventDto {
  description: string;
  type: EventType;
  userId: number;
}
