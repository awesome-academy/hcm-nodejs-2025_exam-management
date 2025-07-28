import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { QueryRunner, Repository, EntityManager, ObjectLiteral } from 'typeorm';

// --- I18n & Request Context ---
export const mockI18nService: jest.Mocked<I18nService> = {
  translate: jest.fn((key: string) => key),
} as any;

export const mockRequestContextService: jest.Mocked<RequestContextService> = {
  getLang: jest.fn().mockReturnValue('vi'),
} as any;

export function withBaseProviders(customProviders: any[] = []) {
  return [
    { provide: I18nService, useValue: mockI18nService },
    { provide: RequestContextService, useValue: mockRequestContextService },
    ...customProviders,
  ];
}

// --- TypeORM Repository ---
export function createMockRepository<T extends ObjectLiteral = any>(): Partial<
  Repository<T>
> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findOneBy: jest.fn(),
    merge: jest.fn(),
  };
}

// --- Factory tạo EntityManager ---
export function createMockEntityManager(): Partial<EntityManager> {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
  };
}

// --- Factory tạo QueryRunner ---
export function createMockQueryRunner(
  manager?: Partial<EntityManager>,
): Partial<QueryRunner> {
  return {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: (manager ?? createMockEntityManager()) as EntityManager,
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };
}

// --- Factory tạo DataSource từ QueryRunner ---
export function createMockDataSource(queryRunner: Partial<QueryRunner>) {
  return {
    createQueryRunner: jest.fn(() => queryRunner),
  };
}

// --- Other Services ---
export const mockCloudinaryService = {
  uploadImage: jest.fn().mockResolvedValue('mock-image-url'),
};
