import { PaginationDto } from '@/common/dtos/pagination.dto';
import { ORDER_STATUSES } from '@/common/order';
import { OrderStatus } from '@/database/entities';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class FindOrdersDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  clientId?: number;

  @IsOptional()
  @IsIn(Object.keys(ORDER_STATUSES), { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: OrderStatus[];
}
