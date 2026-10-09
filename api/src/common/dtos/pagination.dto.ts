import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    return parseInt(value.value ? value.value : 1);
  })
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform((value) => parseInt(value.value ? value.value : 10))
  limit: number = 10;

  @IsOptional()
  @IsString()
  search: string = '';
}

type PaginatedInfo<T> = {
  data: T[];
  totalRows: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type Paginated<T> = Promise<PaginatedInfo<T>>;
