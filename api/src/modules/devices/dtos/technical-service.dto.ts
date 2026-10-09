import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class TechnicalServiceDto {
  @IsNumber()
  technicalServiceProviderId: number;

  @IsString()
  technicalServiceDate: Date;

  @IsString()
  technicalServiceDescription: string;
}
