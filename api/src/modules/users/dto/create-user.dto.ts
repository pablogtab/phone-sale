import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsObject,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  name: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  lastname: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  password: string;

  @IsString()
  role: string;

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
}
