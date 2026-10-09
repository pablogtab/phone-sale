import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateCashAccountDto } from './create-cash-account.dto';

export class UpdateCashAccountDto extends PartialType(CreateCashAccountDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
