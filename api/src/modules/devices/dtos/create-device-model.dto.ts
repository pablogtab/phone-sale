import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateDeviceModelDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsNumber({}, { each: true })
  colors: number[];

  @IsNumber({}, { each: true })
  storageSizes: number[];

  @IsNumber({}, { each: true })
  recommendedAccesories: number[];
}
