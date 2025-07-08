import { Repository, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export async function findOneByField<
  T extends ObjectLiteral,
  K extends keyof T,
>(
  repo: Repository<T>,
  field: K,
  value: T[K],
  notFoundMessage?: string,
): Promise<T> {
  const result = await repo.findOneBy({ [field]: value } as any);
  if (!result) {
    throw new NotFoundException(notFoundMessage);
  }
  return result;
}
