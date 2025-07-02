import { Repository, ObjectLiteral } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

export async function findOneByField<T extends ObjectLiteral, K extends keyof T>(
  repo: Repository<T>,
  field: K,
  value: T[K],
  notFoundMessage?: string,
): Promise<T> {
  try {
    const result = await repo.findOneBy({ [field]: value } as any);
    if (!result) {
      throw new NotFoundException(
        notFoundMessage || `Không tìm thấy ${String(field)} = ${value}`,
      );
    }
    return result;
  } catch (error) {
    throw new InternalServerErrorException(
      `Lỗi khi tìm theo ${String(field)}: ${error.message}`,
    );
  }
}
