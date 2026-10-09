import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceModelDto } from './create-device-model.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDeviceModelDto extends PartialType(CreateDeviceModelDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
