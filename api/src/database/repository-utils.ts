import { NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  ILike,
  In,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export async function updateEntity<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
  patch: DeepPartial<T>,
): Promise<T> {
  const entity = await repository.findOneBy(where);
  if (!entity) throw new NotFoundException('Resource not found');
  return repository.save(repository.merge(entity, patch));
}

export async function removeEntity<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
): Promise<T> {
  const entity = await repository.findOneBy(where);
  if (!entity) throw new NotFoundException('Resource not found');
  return repository.remove(entity);
}

export const optionalIn = <T>(values: T[] | undefined) =>
  values === undefined ? undefined : In(values);
export const containsText = (text: string | undefined) =>
  text === undefined
    ? undefined
    : ILike(`%${text.replace(/[\\%_]/g, '\\$&')}%`);
