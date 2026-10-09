import {
  ACCOUNTING_ACCOUNT_TYPES,
  AccountingAccountType,
} from '@/common/accounting';
import { CURRENCIES, CurrencyType } from '@/common/currency';
import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class SimpleTransactionDto {
  @Matches(`^${Object.values(ACCOUNTING_ACCOUNT_TYPES).join('|')}$`, 'i')
  accountType: AccountingAccountType;

  @IsNumber()
  amount: number;

  @Matches(`^${Object.keys(CURRENCIES).join('|')}$`, 'i')
  currency: CurrencyType;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsNumber()
  providerId?: number;

  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  bankId?: number;

  @IsOptional()
  @IsNumber()
  cashAccountId?: number;
}
