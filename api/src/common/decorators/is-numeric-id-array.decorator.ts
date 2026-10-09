import { applyDecorators } from '@nestjs/common';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export function IsNumericIdArray(): PropertyDecorator {
  return applyDecorators(
    // Transform the input into an array of numbers
    Transform(({ value }) => {
      if (Array.isArray(value)) {
        return value.map((v) => Number(v)).filter((v) => !isNaN(v));
      }
      return [];
    }),
    // Validate that each item in the array is a number with no decimals
    IsNumber({ maxDecimalPlaces: 0 }, { each: true }),
  );
}
