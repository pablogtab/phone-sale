import { DEVICE_STATUSES } from '@/common/devices';
import { BaseQueryParamDto } from '@/common/dtos/base-query-param.dto';
import { IsNumericIdArray } from '@/common/decorators/is-numeric-id-array.decorator';
import { DeviceStatus } from '@/database/entities';
import { Transform } from 'class-transformer';
import { IsOptional, Matches } from 'class-validator';

export class SearchDeviceQueryDto extends BaseQueryParamDto {
  @IsOptional()
  @IsNumericIdArray()
  modelId?: number[];

  @IsOptional()
  @IsNumericIdArray()
  storageSizeId?: number[];

  @IsOptional()
  @IsNumericIdArray()
  colorId?: number[];

  @IsOptional()
  @Matches(`^${Object.values(DEVICE_STATUSES).join('|')}$`, 'i', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: DeviceStatus[];
}
