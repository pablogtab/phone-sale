import { IsString, MinLength } from 'class-validator';

export class CreateDeviceStorageSizeDto {
  @IsString()
  @MinLength(3)
  size: string;
}
