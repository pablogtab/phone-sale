import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, ValidateNested } from 'class-validator';

export class UpsertDevicePriceReferenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Upsert)
  data: Upsert[];
}

class Upsert {
  @IsNumber()
  modelId: number;

  @IsNumber()
  storageSizeId: number;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  sellingPriceSale: number;

  @IsNumber()
  sellingPriceWholesale: number;

  @IsBoolean()
  isUsed: boolean;
}
