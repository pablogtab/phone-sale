import {
  ACCOUNTING_ACCOUNT_TYPES,
  AccountingAccountType,
} from '@/common/accounting';
import { BaseQueryParamDto } from '@/common/dtos/base-query-param.dto';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Matches } from 'class-validator';

export class GetAccountingAccountsQuery extends BaseQueryParamDto {
  @Matches(`^${Object.values(ACCOUNTING_ACCOUNT_TYPES).join('|')}$`, 'i')
  type: AccountingAccountType;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  entityId?: number;
}
