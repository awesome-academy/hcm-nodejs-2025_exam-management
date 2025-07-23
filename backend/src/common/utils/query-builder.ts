import {
  Equal,
  Like,
  Repository,
  FindManyOptions,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';

export type QueryMapping = Record<
  string,
  'equal' | 'like' | ((value: any) => any)
>;

export async function buildAndExecuteQuery<T extends ObjectLiteral>(
  repository: Repository<T>,
  query: Record<string, any>,
  mappings: QueryMapping,
  options?: Omit<FindManyOptions<T>, 'where'>,
): Promise<T[]> {
  const where: FindOptionsWhere<T> = {};

  for (const key in mappings) {
    const value = query[key];
    if (value === undefined || value === null || value === '') continue;

    const handler = mappings[key];
    if (handler === 'equal') {
      (where as any)[key] = Equal(value);
    } else if (handler === 'like') {
      (where as any)[key] = Like(`%${value.toLowerCase()}%`);
    } else if (typeof handler === 'function') {
      (where as any)[key] = handler(value);
    }
  }

  return repository.find({
    ...options,
    where,
  });
}
