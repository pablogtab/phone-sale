import { BaseQueryParamDto } from '@/common/dtos/base-query-param.dto';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class SearchCashAccountQueryDto extends BaseQueryParamDto {
  @IsOptional()
  @IsBoolean()
  @Transform((value) => value.value === 'true')
  active?: boolean;
}
