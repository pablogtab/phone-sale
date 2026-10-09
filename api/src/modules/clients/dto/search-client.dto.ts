import { BaseQueryParamDto } from '@/common/dtos/base-query-param.dto';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateIf } from 'class-validator';

export class SearchClientDto extends BaseQueryParamDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  wholesaler?: boolean;
}
