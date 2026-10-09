import { DatabaseService } from './database.service';

/** Keep all domain service calls in the same transaction until the operation finishes. */
export function Transactional(): MethodDecorator {
  return (_target, _key, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (
      this: { database: DatabaseService },
      ...args: unknown[]
    ) {
      return this.database.transaction(() => original.apply(this, args));
    };
  };
}
