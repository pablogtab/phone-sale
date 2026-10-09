import { CurrencyType } from '@/common/currency';
import { AccountingAccountType } from '@/database/entities';

export class OrderPaymentTransactionDto {
  eventId: number;
  accountType: AccountingAccountType;
  amount: number;
  currency: CurrencyType;
  description: string;
  exchangeRate: number;
  providerId?: number;
  clientId?: number;
  userId?: number;
  bankId?: number;
  cashAccountId?: number;
}
