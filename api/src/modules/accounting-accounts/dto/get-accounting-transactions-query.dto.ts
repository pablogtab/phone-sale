import {
  ACCOUNTING_ACCOUNT_TYPES,
  AccountingAccountType,
} from '@/common/accounting';
import { CURRENCIES } from '@/common/currency';
import { ArrayTransform } from '@/common/decorators/array-transform.decorator';
import { NumberTransform } from '@/common/decorators/number-transform.decorator';
import { Currency } from '@/database/entities';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class GetAccountingTransactionsQuery {
  @IsIn(Object.values(ACCOUNTING_ACCOUNT_TYPES))
  type: AccountingAccountType;

  @IsNumber()
  @NumberTransform()
  entityId: number;

  @IsOptional()
  @IsIn(Object.keys(CURRENCIES), { each: true })
  @ArrayTransform()
  currency?: Currency[];

  @IsOptional()
  @NumberTransform()
  limit?: number = 50;
}
