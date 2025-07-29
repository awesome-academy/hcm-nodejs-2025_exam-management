import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { DataSource } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { Question } from '../questions/entities/question.entity';
import {
  createMockRepository,
  createMockDataSource,
  createMockEntityManager,
  createMockQueryRunner,
  mockI18nService,
  mockRequestContextService,
} from '@/test/utils/base-test.utils';
import { BadRequestException } from '@nestjs/common';
import * as AnswerValidator from '../shared/validators/answer.validator';
import { TestSessionStatus } from '@/common/enums/testSession.enum';

jest.mock('../shared/validators/answer.validator', () => ({
  validateMultipleChoiceAnswers: jest.fn(),
  validateEssayAnswers: jest.fn(),
}));
import { QuestionType } from '@/common/enums/question.enum';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { AnswerSerializer } from './serializers/answer.serializer';

describe('AnswerService', () => {
  let service: AnswerService;

  const mockAnswerRepo = createMockRepository<Answer>();
  const mockQuestionRepo = createMockRepository<Question>();
  const mockManager = createMockEntityManager();
  const mockQueryRunner = createMockQueryRunner(mockManager);
  const mockDataSource = createMockDataSource(mockQueryRunner);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        { provide: getRepositoryToken(Answer), useValue: mockAnswerRepo },
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find Answer By Question ID', () => {
    it('should return serialized answers when found', async () => {
      const mockAnswers = [
        {
          id: 1,
          answer_text: 'Answer 1',
          question: {},
          user_answers: [],
        },
        {
          id: 2,
          answer_text: 'Answer 2',
          question: {},
          user_answers: [],
        },
      ];

      (mockAnswerRepo.find as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await service.findByQuestion(1);

      expect(mockAnswerRepo.find).toHaveBeenCalledWith({
        where: { question_id: 1 },
        relations: ['question', 'user_answers'],
        order: { id: 'ASC' },
      });

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, answer_text: 'Answer 1' }),
          expect.objectContaining({ id: 2, answer_text: 'Answer 2' }),
        ]),
      );
    });

    it('should throw BadRequestException with translated message on unexpected error', async () => {
      (mockAnswerRepo.find as jest.Mock).mockRejectedValue(
        new Error('DB failed'),
      );

      await expect(service.findByQuestion(1)).rejects.toThrow(
        'answer.fetch_failed',
      );
    });

    it('should rethrow BadRequestException if it is the original error', async () => {
      const badReqError = new BadRequestException('Invalid question_id');
      (mockAnswerRepo.find as jest.Mock).mockRejectedValue(badReqError);

      await expect(service.findByQuestion(1)).rejects.toThrow(badReqError);
    });
  });

  describe('Soft Delete Answer', () => {
    it('should soft delete answer and return success message', async () => {
      const mockAnswer = {
        id: 1,
        user_answers: [],
      };

      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(mockAnswer);
      (mockAnswerRepo.softDelete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.delete(1);

      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user_answers'],
      });
      expect(mockAnswerRepo.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'answer.deleted_success' });
    });

    it('should throw not_found if answer does not exist', async () => {
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow('answer.not_found');
    });

    it('should throw delete_denied_has_user_answers if answer has user_answers', async () => {
      const mockAnswer = {
        id: 1,
        user_answers: [{}],
      };

      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(mockAnswer);
      await expect(service.delete(1)).rejects.toThrow(
        'answer.delete_denied_has_user_answers',
      );
    });

    it('should throw delete_failed on unexpected error', async () => {
      (mockAnswerRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('Unknown DB error'),
      );
      await expect(service.delete(1)).rejects.toThrow('answer.delete_failed');
    });
  });

  describe('Create Answer', () => {
    const mockDto: CreateAnswerDto = {
      answer_text: 'Test Answer',
      is_correct: true,
      explanation: 'Explanation',
    };

    it('should create and return serialized answer for multiple choice question', async () => {
      const mockQuestion = {
        id: 1,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };
      const mockSavedAnswer = { id: 1, ...mockDto, question_id: 1 };

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(mockQuestion);
      (mockAnswerRepo.find as jest.Mock).mockResolvedValue([]);
      (mockAnswerRepo.create as jest.Mock).mockReturnValue(mockSavedAnswer);
      (mockAnswerRepo.save as jest.Mock).mockResolvedValue(mockSavedAnswer);
      (
        AnswerValidator.validateMultipleChoiceAnswers as jest.Mock
      ).mockResolvedValue(undefined);

      const result = await service.create(1, mockDto);

      expect(mockQuestionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockAnswerRepo.find).toHaveBeenCalledWith({
        where: { question_id: 1 },
      });
      expect(
        AnswerValidator.validateMultipleChoiceAnswers,
      ).toHaveBeenCalledWith(mockI18nService, [mockDto]);
      expect(mockAnswerRepo.save).toHaveBeenCalledWith(mockSavedAnswer);
      expect(result).toBeInstanceOf(AnswerSerializer);
      expect(result).toEqual(
        expect.objectContaining({ id: 1, answer_text: 'Test Answer' }),
      );
    });

    it('should create and return answer for essay question', async () => {
      const mockQuestion = { id: 1, question_type: QuestionType.ESSAY };

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(mockQuestion);
      (mockAnswerRepo.find as jest.Mock).mockResolvedValue([]);
      (mockAnswerRepo.create as jest.Mock).mockReturnValue({
        id: 2,
        ...mockDto,
        question_id: 1,
      });
      (mockAnswerRepo.save as jest.Mock).mockResolvedValue({
        id: 2,
        ...mockDto,
        question_id: 1,
      });
      (AnswerValidator.validateEssayAnswers as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await service.create(1, mockDto);

      expect(AnswerValidator.validateEssayAnswers).toHaveBeenCalledWith(
        mockI18nService,
        [mockDto],
      );
      expect(result).toEqual(expect.objectContaining({ id: 2 }));
    });

    it('should throw question.not_found if question does not exist', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.create(1, mockDto)).rejects.toThrow(
        'question.not_found',
      );
    });

    it('should rethrow BadRequestException from validator', async () => {
      const mockQuestion = {
        id: 1,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(mockQuestion);
      (mockAnswerRepo.find as jest.Mock).mockResolvedValue([]);
      (
        AnswerValidator.validateMultipleChoiceAnswers as jest.Mock
      ).mockRejectedValue(new BadRequestException('Invalid MCQ format'));

      await expect(service.create(1, mockDto)).rejects.toThrow(
        'Invalid MCQ format',
      );
    });

    it('should throw answer.create_failed on unknown error', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('DB exploded'),
      );

      await expect(service.create(1, mockDto)).rejects.toThrow(
        'answer.create_failed',
      );
    });
  });

  describe('Update Answer', () => {
    it('should update and return serialized answer when no snapshot exists', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Old Answer',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };
      const mockUpdatedDto = {
        answer_text: 'New Answer',
      };
      const otherAnswers = [];

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockQuestion,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(null);

      // mock transaction
      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb(mockManager as any);
        },
      );

      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // no snapshot
      });

      (mockManager.find as jest.Mock).mockResolvedValueOnce(otherAnswers);
      (
        AnswerValidator.validateMultipleChoiceAnswers as jest.Mock
      ).mockResolvedValue(undefined);
      (mockManager.merge as jest.Mock).mockReturnValue({
        ...mockAnswer,
        ...mockUpdatedDto,
      });
      (mockManager.save as jest.Mock).mockResolvedValue({
        ...mockAnswer,
        ...mockUpdatedDto,
      });

      const result = await service.update(1, mockUpdatedDto);

      expect(result).toBeInstanceOf(AnswerSerializer);
      expect(result).toEqual(
        expect.objectContaining({ answer_text: 'New Answer' }),
      );
    });

    it('should throw answer.not_found if answer does not exist', async () => {
      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb(mockManager as any);
        },
      );

      (mockManager.findOne as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.update(1, {})).rejects.toThrow('answer.not_found');
    });

    it('should throw update_failed if unexpected error occurs', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Answer',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.ESSAY,
      };

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockQuestion,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async () => {
        throw new Error('Unexpected DB error');
      });

      await expect(service.update(1, {})).rejects.toThrow('update_failed');
    });

    it('should throw question.not_found if question not found', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 999,
        is_active: true,
        answer_text: 'Old Answer',
      };

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.update(1, {})).rejects.toThrow('question.not_found');
    });

    it('should clone answer if it exists in snapshot and dto changes content', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Old Answer',
        explanation: 'Old explanation',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };
      const dto = {
        answer_text: 'New Answer',
        explanation: 'Updated explanation',
      };

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockQuestion,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(null);
      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb(mockManager as any);
        },
      );

      // Snapshot exists
      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 100 }),
      });

      const mockClonedAnswer = {
        ...mockAnswer,
        ...dto,
        is_active: true,
      };

      (mockManager.create as jest.Mock).mockReturnValue(mockClonedAnswer);
      (mockManager.save as jest.Mock).mockResolvedValue(mockClonedAnswer);
      (mockManager.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.update(1, dto);

      expect(mockManager.create).toHaveBeenCalledWith(Answer, {
        ...mockAnswer,
        ...dto,
        id: undefined,
        is_active: true,
      });
      expect(mockManager.update).toHaveBeenCalledWith(
        Answer,
        { id: 1 },
        { is_active: false },
      );
      expect(result).toBeInstanceOf(AnswerSerializer);
      expect(result).toEqual(
        expect.objectContaining({ answer_text: 'New Answer' }),
      );
    });

    it('should validate and update essay answer if not in snapshot', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Old Answer',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.ESSAY,
      };
      const dto = {
        answer_text: 'Updated essay answer',
      };
      const otherAnswers = [];

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockQuestion,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(null);
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager as any),
      );

      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // not in snapshot
      });

      (mockManager.find as jest.Mock).mockResolvedValueOnce(otherAnswers);
      (AnswerValidator.validateEssayAnswers as jest.Mock).mockResolvedValue(
        undefined,
      );

      const merged = { ...mockAnswer, ...dto };
      (mockManager.merge as jest.Mock).mockReturnValue(merged);
      (mockManager.save as jest.Mock).mockResolvedValue(merged);

      const result = await service.update(1, dto);

      expect(result).toBeInstanceOf(AnswerSerializer);
      expect(result).toEqual(
        expect.objectContaining({ answer_text: dto.answer_text }),
      );
    });

    it('should throw update_denied_active_test_session if session is in progress', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Old Answer',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };

      const activeTestSession = {
        session: {
          status: TestSessionStatus.IN_PROGRESS,
          is_completed: false,
        },
      };

      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockAnswer,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        mockQuestion,
      );
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValueOnce(
        activeTestSession,
      );

      await expect(service.update(1, {})).rejects.toThrow(
        'answer.update_denied_active_test_session',
      );
    });

    it('should directly update is_active if answer is in snapshot and only is_active is changed', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: false,
        answer_text: 'Answer A',
        explanation: 'Some explanation',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };
      const dto = {
        is_active: true,
      };

      (mockDataSource.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAnswer)
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(null);

      // Mock transaction
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager as any),
      );

      // Mock snapshot tồn tại
      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 100 }),
      });

      const expectedUpdated = {
        ...mockAnswer,
        ...dto,
      };

      (mockManager.merge as jest.Mock).mockReturnValue(expectedUpdated);
      (mockManager.save as jest.Mock).mockResolvedValue(expectedUpdated);

      const result = await service.update(1, dto);

      expect(mockManager.create).not.toHaveBeenCalled();
      expect(mockManager.update).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(AnswerSerializer);
      expect(result).toEqual(expect.objectContaining({ is_active: true }));
    });

    it('should directly update is_active if other fields are unchanged (equal to DB)', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: false,
        answer_text: 'Answer A',
        explanation: 'Some explanation',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };

      const dto = {
        is_active: true,
        answer_text: 'Answer A',
        explanation: 'Some explanation',
      };

      // Mock DB
      (mockDataSource.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAnswer)
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(null);

      // Mock snapshot tồn tại
      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 123 }),
      });

      // Mock transaction
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager as any),
      );

      const expectedUpdated = { ...mockAnswer, ...dto };

      (mockManager.merge as jest.Mock).mockReturnValue(expectedUpdated);
      (mockManager.save as jest.Mock).mockResolvedValue(expectedUpdated);

      const result = await service.update(1, dto);

      expect(mockManager.create).not.toHaveBeenCalled();
      expect(mockManager.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ is_active: true }));
    });

    it('should re-throw BadRequestException without wrapping into update_failed', async () => {
      const mockAnswer = {
        id: 1,
        question_id: 2,
        is_active: true,
        answer_text: 'Answer A',
      };
      const mockQuestion = {
        id: 2,
        question_type: QuestionType.MULTIPLE_CHOICE,
      };

      (mockDataSource.manager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockAnswer)
        .mockResolvedValueOnce(mockQuestion);

      (mockManager.createQueryBuilder as any) = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const dto = {
        answer_text: 'Updated answer',
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(async () => {
        throw new BadRequestException('custom.bad_request_error');
      });
      await expect(service.update(1, dto)).rejects.toThrow(
        'custom.bad_request_error',
      );
    });
  });
});
