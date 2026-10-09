import { IsNumber, IsString, IsUUID } from 'class-validator';

export class TestDeviceDto {
  @IsNumber()
  deviceId: number;

  @IsString()
  @IsUUID('4')
  testerUserPublicId: string;
}
