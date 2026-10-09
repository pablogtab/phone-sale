import { IsHexColor, IsString, MinLength } from 'class-validator';

export class CreateDeviceColorDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @IsHexColor()
  hex: string;
}
