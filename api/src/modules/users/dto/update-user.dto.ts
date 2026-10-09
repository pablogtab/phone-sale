import { Optional } from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsDefined,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class Dto {
  @IsDefined()
  @IsNotEmpty()
  id: number;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  lastname: string;

  @Optional()
  @IsObject()
  permissions: {
    users?: string[];
    banks?: string[];
    providers?: string[];
    cash_accounts?: string[];
    accounting_accounts?: string[];
    clients?: string[];
  };

  @IsString()
  role: string;
}

export class UpdateUserDto extends PartialType(Dto) {}
