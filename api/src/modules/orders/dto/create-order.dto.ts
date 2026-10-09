import { CURRENCIES, CurrencyType } from '@/common/currency';
import { ORDER_TYPES } from '@/common/order';
import { CreateDeviceDto } from '@/modules/devices/dtos/create-device.dto';
import { OrderType } from '@/database/entities';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  clientId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  products: CreateOrderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderPaymentDto)
  payments: CreateOrderPaymentDto[];

  @IsBoolean()
  @IsOptional()
  credit?: boolean;

  @Matches(`^${Object.keys(ORDER_TYPES).join('|')}$`, 'i')
  type: OrderType;

  @IsOptional()
  @IsNumber()
  deliveredByUserId?: number;
}

export class CreateOrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  priceUSD: number;

  @IsNumber()
  priceARS: number;

  @IsNumber()
  exchangeRate: number;
}

export class CreateOrderPaymentDto {
  @Matches(/(cash|bank_transfer|device)/)
  method: 'cash' | 'bank_transfer' | 'device';

  @Matches(`^${Object.keys(CURRENCIES).join('|')}$`, 'i')
  currency: CurrencyType;

  @IsNumber()
  exchangeRate: number;

  @IsNumber()
  amountARS: number;

  @IsNumber()
  amountUSD: number;

  @IsString()
  description: string;

  @ValidateIf((o) => o.method === 'device')
  @ValidateNested()
  @Type(() => CreateDeviceDto)
  device?: CreateDeviceDto;

  @IsOptional()
  cashAccountId?: number;

  @IsOptional()
  providerId?: number;

  @IsOptional()
  bankId?: number;

  @IsOptional()
  userId?: number;
}
