import { DEVICE_CONDITIONS, DeviceCondition } from '@/common/devices';
import { DeviceFileType, DeviceStatus } from '@/database/entities';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateDeviceServiceDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  gradingId?: number | null;

  @IsString()
  @IsIn(Object.keys(DEVICE_CONDITIONS))
  condition: DeviceCondition;

  @IsOptional()
  @IsString()
  internalComments?: string;

  @IsOptional()
  @IsString()
  publicComments?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  batteryCicleCount?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  batteryHealth?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value))
  imei?: string;

  @IsOptional()
  @IsString()
  @Transform((value) => String(value.value))
  imei2?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasProblem: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  oficialWarranty: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
  warrantyExpiresAt?: string;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  modelId: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  storageSizeId: number;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  colorId: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  originProviderId?: number;

  @ValidateIf((o) => o.originProviderId)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  purchasePrice?: number;

  mainPhotoUrl?: string;
  aditionalFiles?: { url: string; description: string; type: DeviceFileType }[];

  @IsNumber()
  @Transform(({ value }) => Number(value))
  depreciation?: number;

  status?: DeviceStatus = 'available';
}
