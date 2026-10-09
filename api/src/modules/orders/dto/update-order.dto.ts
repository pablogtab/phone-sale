import { OmitType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends OmitType(CreateOrderDto, [
  'exchangeRate',
  'clientId',
  'credit',
  'type',
] as const) {}
