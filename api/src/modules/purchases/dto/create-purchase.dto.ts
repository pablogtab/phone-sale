import { Currency } from '@/database/entities';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Max,
  IsBoolean,
  IsIn,
  IsNumber,
  IsPositive,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreatePurchaseDto {
  @IsNumber()
  @IsPositive()
  providerId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseProductDto)
  products: CreatePurchaseProductDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchasePaymentDto)
  payments: CreatePurchasePaymentDto[];

  @IsNumber()
  @IsPositive()
  total: number;

  @IsNumber()
  @IsPositive()
  exchangeRate: number;

  @IsBoolean()
  transit: boolean;
}

export class CreatePurchaseProductDto {
  @IsIn(['product', 'device'])
  type: 'product' | 'device';

  @IsInt()
  @Max(10000)
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @ValidateIf((o) => o.type === 'product')
  @IsNumber()
  @IsPositive()
  productId?: number;

  @ValidateIf((o) => o.type === 'device')
  @IsNumber()
  @IsPositive()
  modelId?: number;

  @ValidateIf((o) => o.type === 'device')
  @IsNumber()
  @IsPositive()
  storageSizeId?: number;

  @ValidateIf((o) => o.type === 'device')
  @IsNumber()
  @IsPositive()
  colorId?: number;
}

export class CreatePurchasePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsIn(['usd', 'ars'])
  currency: Currency;

  @IsIn(['cash', 'bank', 'credit'])
  type: 'cash' | 'bank' | 'credit';

  @ValidateIf((o) => o.type === 'bank')
  @IsNumber()
  @IsPositive()
  bankId?: number;

  @ValidateIf((o) => o.type === 'cash')
  @IsNumber()
  @IsPositive()
  cashAccountId?: number;
}
