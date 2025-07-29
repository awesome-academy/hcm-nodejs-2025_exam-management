import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { DataSource } from 'typeorm';
import { Test as TestEntity } from './entities/test.entity';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { BadRequestException } from '@nestjs/common';
import {
  createMockRepository,
  createMockDataSource,
  createMockEntityManager,
  createMockQueryRunner,
  mockI18nService,
  mockRequestContextService,
} from '@/test/utils/base-test.utils';

describe('TestService', () => {
  let service: TestService;

  const mockTestRepo = createMockRepository<TestEntity>();
  const mockManager = createMockEntityManager();
  const mockQueryRunner = createMockQueryRunner(mockManager);
  const mockDataSource = createMockDataSource(mockQueryRunner);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestService,
        { provide: getRepositoryToken(TestEntity), useValue: mockTestRepo },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find All Test API', () => {
    it('should return filtered list of tests', async () => {
      const fakeTests = [{ id: 1 }] as TestEntity[];
      (mockTestRepo.find as jest.Mock).mockResolvedValue(fakeTests);

      const result = await service.findAll({
        subject_id: '1',
        is_published: 'true',
      });

      expect(mockTestRepo.find).toHaveBeenCalledWith({
        where: { subject_id: 1, is_published: true },
        relations: ['creator', 'subject', 'test_sessions'],
        order: { id: 'ASC' },
      });
      expect(result).toEqual(expect.any(Array));
    });

    it('should rethrow BadRequestException if it is thrown', async () => {
      const badRequest = new BadRequestException('invalid request');
      (mockTestRepo.find as jest.Mock).mockRejectedValue(badRequest);

      await expect(service.findAll()).rejects.toThrow(BadRequestException);
      await expect(service.findAll()).rejects.toThrow('invalid request');
    });

    it('should throw BadRequestException with message "test.fetch_failed" on unknown error', async () => {
      (mockTestRepo.find as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.findAll()).rejects.toThrow('test.fetch_failed');
    });
  });

  describe('Find Test By ID', () => {
    it('should return test by id', async () => {
      const fakeTest = { id: 1 } as TestEntity;
      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(fakeTest);

      const result = await service.findOneById(1);
      expect(mockTestRepo.findOne).toHaveBeenCalled();
      expect(result).toEqual(expect.any(Object));
    });

    it('should throw not_found if test not found', async () => {
      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOneById(1)).rejects.toThrow('test.not_found');
    });

    it('should throw fetch_failed on unknown error', async () => {
      (mockTestRepo.findOne as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(service.findOneById(1)).rejects.toThrow('test.fetch_failed');
    });
  });

  describe('Soft Delete Test API', () => {
    it('should soft delete test by id', async () => {
      const testEntity = { id: 1 } as TestEntity;
      (mockTestRepo.findOneBy as jest.Mock).mockResolvedValue(testEntity);
      (mockTestRepo.softDelete as jest.Mock).mockResolvedValue({});

      const result = await service.softDelete(1);
      expect(mockTestRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result.message).toBeDefined();
    });

    it('should throw not_found if test not found', async () => {
      (mockTestRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.softDelete(1)).rejects.toThrow('test.not_found');
    });

    it('should throw delete_failed on unknown error', async () => {
      (mockTestRepo.findOneBy as jest.Mock).mockRejectedValue(new Error());
      await expect(service.softDelete(1)).rejects.toThrow('test.delete_failed');
    });
  });

  describe('Create Test API', () => {
    const dto = {
      title: 'Test title',
      time_limit: 60,
      passing_score: 5,
      subject_id: 1,
      easy_question_count: 1,
      medium_question_count: 2,
      hard_question_count: 2,
    };

    it('should calculate question_count and create new test', async () => {
      const user = { id: 123 };
      const totalCount = 5;
      const test = {
        id: 1,
        ...dto,
        creator_id: user.id,
        question_count: totalCount,
        version: 1,
        is_latest: true,
      } as TestEntity;

      (mockTestRepo.create as jest.Mock).mockReturnValue(test);
      (mockTestRepo.save as jest.Mock).mockResolvedValue(test);

      const result = await service.create(dto, user);

      expect(mockTestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          creator_id: 123,
          question_count: totalCount,
          version: 1,
          is_latest: true,
        }),
      );
      expect(mockTestRepo.save).toHaveBeenCalledWith(test);
      expect(result).toEqual(expect.any(Object));
    });

    it('should default missing question counts to 0', async () => {
      const user = { id: 99 };
      const partialDto = {
        title: 'Only title and subject',
        time_limit: 60,
        passing_score: 5,
        subject_id: 1,
      };

      const totalCount = 0;

      const test = {
        id: 2,
        ...partialDto,
        creator_id: user.id,
        question_count: totalCount,
        version: 1,
        is_latest: true,
      } as TestEntity;

      (mockTestRepo.create as jest.Mock).mockReturnValue(test);
      (mockTestRepo.save as jest.Mock).mockResolvedValue(test);

      const result = await service.create(partialDto as any, user);

      expect(mockTestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          creator_id: 99,
          question_count: 0,
          version: 1,
          is_latest: true,
        }),
      );
      expect(result).toEqual(expect.any(Object));
    });

    it('should rethrow BadRequestException if thrown', async () => {
      const error = new BadRequestException('bad input');
      (mockTestRepo.save as jest.Mock).mockRejectedValue(error);

      await expect(service.create(dto, { id: 1 })).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(dto, { id: 1 })).rejects.toThrow('bad input');
    });

    it('should throw create_failed on unknown error', async () => {
      (mockTestRepo.save as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.create(dto, { id: 1 })).rejects.toThrow(
        'test.create_failed',
      );
    });
  });

  describe('Update Test API', () => {
    const testId = 1;
    it('should update test directly if no session exists', async () => {
      const oldTest = {
        id: testId,
        version: 1,
        is_latest: true,
        is_published: true,
        test_sessions: [],
        easy_question_count: 1,
        medium_question_count: 1,
        hard_question_count: 1,
      } as any;

      const dto = { easy_question_count: 2 };

      const expectedUpdated = {
        ...oldTest,
        ...dto,
        question_count: 2 + 1 + 1,
      };

      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(oldTest);
      (mockManager.save as jest.Mock).mockResolvedValue(expectedUpdated);

      const result = await service.update(testId, dto);

      expect(mockManager.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.any(Object));
    });

    it('should update directly if only safe fields are changed and has sessions', async () => {
      const oldTest = {
        id: testId,
        version: 1,
        is_latest: true,
        is_published: true,
        test_sessions: [{ status: TestSessionStatus.SUBMITTED }],
        easy_question_count: 2,
        medium_question_count: 3,
        hard_question_count: 4,
      } as any;

      const dto = {
        is_published: false,
      };

      const expectedUpdated = {
        ...oldTest,
        ...dto,
        question_count: 2 + 3 + 4,
      };

      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(oldTest);
      (mockManager.save as jest.Mock).mockResolvedValue(expectedUpdated);

      const result = await service.update(testId, dto);

      expect(mockManager.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.any(Object));
    });

    it('should clone new test if unsafe change and has submitted session', async () => {
      const oldTest = {
        id: testId,
        version: 1,
        is_latest: true,
        is_published: true,
        test_sessions: [{ status: TestSessionStatus.SUBMITTED }],
        easy_question_count: 1,
        medium_question_count: 1,
        hard_question_count: 1,
      } as any;

      const clonedTest = { id: 2 } as any;
      const dto = { easy_question_count: 10 };

      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(oldTest);
      (mockManager.save as jest.Mock).mockResolvedValueOnce(oldTest);
      (mockManager.save as jest.Mock).mockResolvedValueOnce(clonedTest);

      const result = await service.update(testId, dto);

      expect(mockManager.save).toHaveBeenCalledTimes(2);
      expect(result).toEqual(expect.any(Object));
    });

    it('should deny update if session in progress', async () => {
      const testEntity = {
        id: testId,
        test_sessions: [
          { status: TestSessionStatus.IN_PROGRESS, is_completed: false },
        ],
      } as any;

      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(testEntity);

      await expect(service.update(testId, {})).rejects.toThrow(
        'test.update_denied_has_in_progress_session',
      );
    });

    it('should throw not_found if test is not found', async () => {
      (mockTestRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update(testId, {})).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(testId, {})).rejects.toThrow(
        'test.not_found',
      );
    });

    it('should rethrow BadRequestException if thrown', async () => {
      const error = new BadRequestException('some issue');
      (mockTestRepo.findOne as jest.Mock).mockRejectedValue(error);

      await expect(service.update(testId, {})).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(testId, {})).rejects.toThrow('some issue');
    });

    it('should throw update_failed on unknown error', async () => {
      (mockTestRepo.findOne as jest.Mock).mockRejectedValue(new Error('fail'));

      await expect(service.update(testId, {})).rejects.toThrow(
        'test.update_failed',
      );
    });
  });
});
