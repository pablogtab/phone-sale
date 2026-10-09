import { IsBoolean, IsNumber } from 'class-validator';

export class FindDevicePriceReferenceDto {
  @IsNumber()
  modelId: number;

  @IsNumber()
  storageSizeId: number;

  @IsBoolean()
  isUsed: boolean;
}
