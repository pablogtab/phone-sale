import { Currency } from '@/database/entities';

export class ValidateTransactionDto {
  accountId: number;
  amount: number;
  currency: Currency;
  description: string;
  eventId: number;
}
