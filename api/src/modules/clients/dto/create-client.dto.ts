import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateClientDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  identifier: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  address: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsDateString({ strict: true, strictSeparator: true })
  birthDate: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform((param) => param.value.toLowerCase())
  instagram: string;

  @IsOptional()
  @IsBoolean()
  wholesaler?: boolean = false;
}
