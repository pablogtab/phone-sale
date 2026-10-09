import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class UpdateIndexesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateIndex)
  data: { id: number; index: number }[];
}

class UpdateIndex {
  @IsNumber()
  id: number;

  @IsNumber()
  index: number;
}
