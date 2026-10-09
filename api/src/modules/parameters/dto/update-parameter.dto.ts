import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateParameterDto {
  @IsNumber()
  @IsOptional()
  valueN?: number;

  @IsString()
  @IsOptional()
  valueS?: string;

  @IsObject()
  @IsOptional()
  valueJ?: object;

  @IsBoolean()
  @IsOptional()
  valueB?: boolean;
}
