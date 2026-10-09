import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceColorDto } from './create-device-color.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeviceColorDto extends PartialType(CreateDeviceColorDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
