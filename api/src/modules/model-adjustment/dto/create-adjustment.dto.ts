import { AdjustmentCategory, AdjustmentType } from '@/common/model-adjustment';
import { IsDefined, IsOptional } from 'class-validator';

export class CreateAdjustmentDto {
  @IsDefined()
  modelId: number;

  @IsDefined()
  type: AdjustmentType;

  @IsOptional()
  rangeStart: number;

  @IsOptional()
  rangeEnd: number;

  @IsDefined()
  factor: number;

  @IsDefined()
  description: AdjustmentCategory;
}
