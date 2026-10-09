import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCashAccountDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;
}
