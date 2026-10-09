import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function NumberTransform(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      const number = Number(value);
      return number;
    }),
  );
}
