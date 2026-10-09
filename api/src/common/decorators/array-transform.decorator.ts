import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

export function ArrayTransform(): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) => {
      if (Array.isArray(value)) {
        return value;
      }
      return [value];
    }),
  );
}
