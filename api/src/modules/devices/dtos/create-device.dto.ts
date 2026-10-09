import { DEVICE_CONDITIONS } from '@/common/devices';
import { DeviceCondition } from '@/database/entities';
import { Transform } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsIn(Object.keys(DEVICE_CONDITIONS))
  condition: DeviceCondition;

  @IsOptional()
  @ValidateIf((o) => o.internalComments !== null)
  @IsString()
  internalComments?: string;

  @IsOptional()
  @ValidateIf((o) => o.publicComments !== null)
  @IsString()
  publicComments?: string;

  @IsOptional()
  @ValidateIf((o) => o.batteryCicleCount !== null)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  batteryCicleCount?: number;

  @IsOptional()
  @ValidateIf((o) => o.batteryHealth !== null)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  batteryHealth?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{15}$/)
  @ValidateIf((o) => o.imei !== null)
  @Transform(({ value }) => (value !== null ? String(value) : null))
  imei?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{15}$/)
  @ValidateIf((o) => o.imei2 !== null)
  @Transform(({ value }) => (value !== null ? String(value) : null))
  imei2?: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasProblem: boolean;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  oficialWarranty: boolean;

  @IsOptional()
  @ValidateIf((o) => o.warrantyExpiresAt !== null)
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
  @ValidateIf((o) => o.originProviderId !== null)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  originProviderId?: number;

  @ValidateIf((o) => o.originProviderId)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  purchasePrice?: number;

  @IsOptional()
  @Allow()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  aditionalFilesDescriptions?: string[];

  @IsOptional()
  hasBeenTested?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  depreciation?: number = 0;
}
