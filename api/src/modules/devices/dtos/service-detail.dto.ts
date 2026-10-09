import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ServiceDetailDto {
  @IsNumber()
  depreciation: number;

  @IsString()
  internalComments: string;

  @IsString()
  technicalServiceDescription: string;

  @IsNumber()
  serviceCost: number;

  @IsBoolean()
  bateryReplacement: boolean;
}
