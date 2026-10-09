import { PartialType } from '@nestjs/mapped-types';

import { CreateDeviceStorageSizeDto } from './create-device-storage-size.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeviceStorageSizeDto extends PartialType(
  CreateDeviceStorageSizeDto,
) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
