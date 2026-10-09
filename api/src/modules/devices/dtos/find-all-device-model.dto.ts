import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class DeviceModelFindAllDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value && value === 'true')
  includePriceReferences?: boolean;
}
