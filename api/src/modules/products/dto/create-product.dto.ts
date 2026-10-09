import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code?: string = '123';

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  description: string;

  @IsNumber()
  stock: number;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  costPrice: number;
}
