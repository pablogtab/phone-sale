import { ACCOUNTING_ACCOUNT_TYPES } from '@/common/accounting';
import { CURRENCIES, CurrencyType } from '@/common/currency';
import { AccountingAccountType } from '@/database/entities';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

class AccountDto {
  @IsNumber()
  entityId: number;

  @IsNumber()
  amount: number;

  @Matches(`^${Object.keys(CURRENCIES).join('|')}$`, 'i')
  currency: CurrencyType;

  @IsIn(Object.keys(ACCOUNTING_ACCOUNT_TYPES))
  type: AccountingAccountType;
}

export class TransferTransactionDto {
  @ValidateNested()
  @Type(() => AccountDto)
  origin: AccountDto;

  @ValidateNested()
  @Type(() => AccountDto)
  destination: AccountDto;

  @IsString()
  details: string;

  @IsPositive()
  @IsNumber()
  exchangeRate: number;
}
