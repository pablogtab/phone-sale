import { AccountingAccountType, Currency } from '@/database/entities';

export class CreateAccountingAccountDto {
  type: AccountingAccountType;
  name: string;
  currency: Currency;
  isAsset: boolean;
  bankId?: number;
  providerId?: number;
  cashAccountId?: number;
  userId?: number;
  clientId?: number;
}
