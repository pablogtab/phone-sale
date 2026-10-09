import { PartialType } from '@nestjs/mapped-types';
import { CreateAdjustmentDto } from './create-adjustment.dto';
import { IsDefined } from 'class-validator';

export class UpdateAdjustmentDto extends PartialType(CreateAdjustmentDto) {
  @IsDefined()
  id: number;
}
