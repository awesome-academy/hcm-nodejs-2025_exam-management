import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from './question.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { DataSource } from 'typeorm';
import { Question } from './entities/question.entity';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { BadRequestException } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import {
  createMockRepository,
  createMockDataSource,
  createMockEntityManager,
  createMockQueryRunner,
  mockI18nService,
  mockRequestContextService,
} from '@/test/utils/base-test.utils';

import { QuestionType } from '@/common/enums/question.enum';
import {
  validateMultipleChoiceAnswers,
  validateEssayAnswers,
} from '../shared/validators/answer.validator';
jest.mock('../shared/validators/answer.validator', () => ({
  validateMultipleChoiceAnswers: jest.fn(),
  validateEssayAnswers: jest.fn(),
}));

describe('QuestionService', () => {
  let service: QuestionService;

  const mockQuestionRepo = createMockRepository<Question>();
  const mockTestSessionQuestionRepo =
    createMockRepository<TestSessionQuestion>();
  const mockManager = createMockEntityManager();
  const mockQueryRunner = createMockQueryRunner(mockManager);
  const mockDataSource = createMockDataSource(mockQueryRunner);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        {
          provide: getRepositoryToken(TestSessionQuestion),
          useValue: mockTestSessionQuestionRepo,
        },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find All Question', () => {
    it('should return an empty array if no questions found', async () => {
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result).toEqual([]);
      expect(mockQuestionRepo.find).toHaveBeenCalled();
    });

    it('should return a list of questions with expected fields', async () => {
      const mockQuestions = [
        {
          id: 1,
          subject_id: 2,
          creator: { id: 3, name: 'John Doe' },
          subject: { id: 2, name: 'Math' },
          answers: [],
        },
      ];
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);

      const result = await service.findAll({});
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('subject');
      expect(result[0]).toHaveProperty('creator');
      expect(mockQuestionRepo.find).toHaveBeenCalled();
    });

    it('should handle query filters correctly (subject_id, question_type)', async () => {
      const query = { subject_id: 1, question_type: 'multiple_choice' };

      (mockQuestionRepo.find as jest.Mock).mockResolvedValue([]);

      await service.findAll(query);

      expect(mockQuestionRepo.find).toHaveBeenCalledWith({
        where: {
          subject_id: expect.anything(),
          question_type: expect.anything(),
        },
        relations: ['creator', 'subject', 'answers'],
        order: { id: 'ASC', subject_id: 'ASC' },
      });
    });
    it('should work correctly when query is undefined', async () => {
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAll(undefined);

      expect(result).toEqual([]);
      expect(mockQuestionRepo.find).toHaveBeenCalledWith({
        where: {},
        relations: ['creator', 'subject', 'answers'],
        order: { subject_id: 'ASC', id: 'ASC' },
      });
    });
  });

  describe('Find Question By ID', () => {
    it('should return question detail if found', async () => {
      const mockQuestion = {
        id: 10,
        creator: { id: 2, name: 'John' },
        subject: { id: 1, name: 'Math' },
        answers: [],
      };
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(mockQuestion);

      const result = await service.findOneById(10);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('id', 10);
      expect(mockQuestionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
        relations: ['creator', 'subject', 'answers'],
      });
    });

    it('should throw BadRequestException if question not found', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOneById(99)).rejects.toThrow(
        'question.not_found',
      );
    });
  });

  describe('Check Before Update or Delete', () => {
    it('should throw BadRequestException if question has active test session', async () => {
      const question = { id: 1 } as Question;

      (mockTestSessionQuestionRepo.find as jest.Mock).mockResolvedValue([
        {
          session: {
            status: TestSessionStatus.IN_PROGRESS,
            is_completed: false,
          },
        },
      ]);

      await expect(
        (service as any).checkBeforeUpdateOrDelete(question),
      ).rejects.toThrow('question.update_denied_has_test_sessions');

      expect(mockTestSessionQuestionRepo.find).toHaveBeenCalledWith({
        where: { question_id: question.id },
        relations: ['session'],
      });
    });

    it('should not throw if no active test session found', async () => {
      const question = { id: 2 } as Question;

      (mockTestSessionQuestionRepo.find as jest.Mock).mockResolvedValue([
        {
          session: {
            status: TestSessionStatus.SUBMITTED,
            is_completed: true,
          },
        },
      ]);

      await expect(
        (service as any).checkBeforeUpdateOrDelete(question),
      ).resolves.not.toThrow();

      expect(mockTestSessionQuestionRepo.find).toHaveBeenCalledWith({
        where: { question_id: question.id },
        relations: ['session'],
      });
    });

    it('should not throw if test session is missing or null', async () => {
      const question = { id: 3 } as Question;

      (mockTestSessionQuestionRepo.find as jest.Mock).mockResolvedValue([
        {
          session: null,
        },
      ]);

      await expect(
        (service as any).checkBeforeUpdateOrDelete(question),
      ).resolves.not.toThrow();
    });

    it('should not throw if test session list is empty', async () => {
      const question = { id: 4 } as Question;

      (mockTestSessionQuestionRepo.find as jest.Mock).mockResolvedValue([]);

      await expect(
        (service as any).checkBeforeUpdateOrDelete(question),
      ).resolves.not.toThrow();
    });
  });

  describe('Soft Delete Question API', () => {
    it('should soft delete if no dependency', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        answers: [],
        user_answers: [],
      });

      (mockTestSessionQuestionRepo.findOne as jest.Mock).mockResolvedValue(
        null,
      );
      jest
        .spyOn(service as any, 'checkBeforeUpdateOrDelete')
        .mockResolvedValue(undefined);
      jest.spyOn(mockQuestionRepo, 'softDelete').mockResolvedValue({
        raw: [],
        generatedMaps: [],
        affected: 1,
      } as UpdateResult);

      const result = await service.softDelete(1);
      expect(result).toEqual({ message: 'question.deleted_success' });
      expect(mockQuestionRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw if not found', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.softDelete(1)).rejects.toThrow('question.not_found');
    });

    it('should throw if has answers', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        answers: [{}],
        user_answers: [],
      });

      await expect(service.softDelete(1)).rejects.toThrow(
        'question.delete_denied_has_answers',
      );
    });

    it('should throw if has user answers', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        answers: [],
        user_answers: [{}],
      });

      await expect(service.softDelete(1)).rejects.toThrow(
        'question.delete_denied_has_user_answers',
      );
    });

    it('should throw if used in test sessions', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        answers: [],
        user_answers: [],
      });

      (mockTestSessionQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 99,
        question_id: 1,
      });

      await expect(service.softDelete(1)).rejects.toThrow(
        'question.delete_denied_has_test_questions',
      );
    });

    it('should throw general delete_failed if unexpected error occurs', async () => {
      (mockQuestionRepo.findOne as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await expect(service.softDelete(1)).rejects.toThrow(
        'question.delete_failed',
      );
    });
  });

  describe('Get Stats By Subject', () => {
    it('should return correct stats for each difficulty level', async () => {
      (mockQuestionRepo.count as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const result = await service.getStatsBySubject(1);

      expect(result).toEqual({ easy: 5, medium: 3, hard: 2 });

      expect(mockQuestionRepo.count).toHaveBeenNthCalledWith(1, {
        where: {
          subject_id: 1,
          difficulty_level: 'easy',
          is_active: true,
        },
      });

      expect(mockQuestionRepo.count).toHaveBeenNthCalledWith(2, {
        where: {
          subject_id: 1,
          difficulty_level: 'medium',
          is_active: true,
        },
      });

      expect(mockQuestionRepo.count).toHaveBeenNthCalledWith(3, {
        where: {
          subject_id: 1,
          difficulty_level: 'hard',
          is_active: true,
        },
      });
    });

    it('should throw BadRequestException with message "question.get_stats_failed" on unexpected error', async () => {
      (mockQuestionRepo.count as jest.Mock).mockRejectedValue(
        new Error('DB connection failed'),
      );

      await expect(service.getStatsBySubject(1)).rejects.toThrow(
        'question.get_stats_failed',
      );
    });
    it('should rethrow BadRequestException if thrown inside getStatsBySubject', async () => {
      const expectedError = new BadRequestException('subject not found');

      (mockQuestionRepo.count as jest.Mock).mockRejectedValue(expectedError);

      await expect(service.getStatsBySubject(1)).rejects.toThrow(expectedError);
    });
  });

  describe('Create Question', () => {
    const user = { id: 1 };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create question and answers successfully (multiple choice)', async () => {
      const dto = {
        content: 'What is 2 + 2?',
        question_type: QuestionType.MULTIPLE_CHOICE,
        subject_id: 1,
        answers: [
          { content: '3', is_correct: false },
          { content: '4', is_correct: true },
        ],
      };

      (mockManager.create as jest.Mock).mockImplementation((entity, data) => ({
        ...data,
        ...(entity === Question ? { id: 1 } : {}),
      }));

      (mockManager.save as jest.Mock).mockImplementation(
        async (_, data) => data,
      );

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        creator: { id: 1 },
        subject: { id: 1 },
        answers: dto.answers,
      });

      const result = await service.create(dto as any, user);

      expect(validateMultipleChoiceAnswers).toHaveBeenCalledWith(
        mockI18nService,
        dto.answers,
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        Question,
        expect.objectContaining({ content: dto.content }),
      );
      expect(mockManager.save).toHaveBeenCalledTimes(2); // save question + answers
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });

    it('should create essay question without answers', async () => {
      const dto = {
        content: 'Explain the theory of relativity.',
        question_type: QuestionType.ESSAY,
        subject_id: 1,
        answers: [],
      };

      (mockManager.create as jest.Mock).mockImplementation((entity, data) => ({
        ...data,
        ...(entity === Question ? { id: 2 } : {}),
      }));

      (mockManager.save as jest.Mock).mockResolvedValueOnce({ id: 2 });

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 2,
        creator: { id: 1 },
        subject: { id: 1 },
        answers: [],
      });

      const result = await service.create(dto as any, user);

      expect(validateEssayAnswers).not.toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(
        Question,
        expect.objectContaining({ content: dto.content }),
      );
      expect(mockManager.save).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 2);
    });

    it('should validate essay answers when present', async () => {
      const dto = {
        content: 'Discuss AI alignment.',
        question_type: QuestionType.ESSAY,
        subject_id: 1,
        answers: [{ content: 'Answer 1' }, { content: 'Answer 2' }],
      };

      (mockManager.create as jest.Mock).mockImplementation((entity, data) => ({
        ...data,
        ...(entity === Question ? { id: 3 } : {}),
      }));

      (mockManager.save as jest.Mock).mockImplementation(
        async (_, data) => data,
      );

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 3,
        creator: { id: 1 },
        subject: { id: 1 },
        answers: dto.answers,
      });

      const result = await service.create(dto as any, user);

      expect(validateEssayAnswers).toHaveBeenCalledWith(
        mockI18nService,
        dto.answers,
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        Question,
        expect.objectContaining({ content: dto.content }),
      );
      expect(mockManager.save).toHaveBeenCalledTimes(2); // save question + answers
      expect(result).toHaveProperty('id', 3);
    });

    it('should rollback and throw if validation fails', async () => {
      const dto = {
        content: 'Invalid question',
        question_type: QuestionType.MULTIPLE_CHOICE,
        subject_id: 1,
        answers: [{ content: '', is_correct: false }],
      };

      (validateMultipleChoiceAnswers as jest.Mock).mockImplementation(() => {
        throw new BadRequestException('Invalid answer');
      });

      await expect(service.create(dto as any, user)).rejects.toThrow(
        'Invalid answer',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback and throw general create_failed error if unexpected exception occurs', async () => {
      const dto = {
        content: 'Question with DB error',
        question_type: QuestionType.ESSAY,
        subject_id: 1,
        answers: [],
      };

      (mockManager.create as jest.Mock).mockImplementation(() => {
        throw new Error('DB write error');
      });

      await expect(service.create(dto as any, user)).rejects.toThrow(
        'question.create_failed',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should create question successfully when answers field is missing', async () => {
      const dto = {
        content: 'Who discovered gravity?',
        question_type: QuestionType.ESSAY,
        subject_id: 1,
      };

      (mockManager.create as jest.Mock).mockImplementation((entity, data) => ({
        ...data,
        ...(entity === Question ? { id: 4 } : {}),
      }));

      (mockManager.save as jest.Mock).mockResolvedValueOnce({ id: 4 });

      (mockQuestionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 4,
        creator: { id: 1 },
        subject: { id: 1 },
        answers: [],
      });

      const result = await service.create(dto as any, user);

      expect(validateMultipleChoiceAnswers).not.toHaveBeenCalled();
      expect(validateEssayAnswers).not.toHaveBeenCalled();
      expect(mockManager.create).toHaveBeenCalledWith(
        Question,
        expect.objectContaining({ content: dto.content }),
      );
      expect(mockManager.save).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('id', 4);
    });
  });

  describe('Update Question API', () => {
    const baseQuestion = {
      id: 1,
      question_text: 'Old question',
      question_type: QuestionType.ESSAY,
      subject_id: 1,
      difficulty_level: 'medium',
      points: 5,
      creator_id: 1,
      version: 1,
      is_active: true,
      user_answers: [],
    };

    it('should throw "question.not_found" if question does not exist', async () => {
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, {} as any)).rejects.toThrow(
        'question.not_found',
      );
    });

    it('should update question directly if no user answers and no unsafe changes', async () => {
      const question = { ...baseQuestion, user_answers: [] };
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(question);

      const dto = {
        is_active: false,
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return await cb(mockManager);
        },
      );

      (mockManager.merge as jest.Mock).mockReturnValue({
        ...question,
        ...dto,
      });
      (mockManager.save as jest.Mock).mockResolvedValue({
        ...question,
        ...dto,
      });

      const result = await service.update(1, dto as any);
      expect(result).toHaveProperty('id', 1);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should clone question if has user answers and unsafe changes', async () => {
      const question = { ...baseQuestion, user_answers: [{}] };
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(question);

      const dto = {
        question_text: 'Updated question text',
        points: 10,
        answers: [
          {
            answer_text: 'Answer 1',
            is_correct: true,
            is_active: true,
          },
        ],
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return await cb(mockManager);
        },
      );

      (mockManager.create as jest.Mock).mockImplementation((_, data) => ({
        id: 99,
        ...data,
      }));

      (mockManager.save as jest.Mock).mockImplementation(
        async (_, data) => data,
      );

      const result = await service.update(1, dto as any);

      expect(mockManager.create).toHaveBeenCalledWith(
        Question,
        expect.objectContaining({
          question_text: 'Updated question text',
          version: 2,
        }),
      );

      expect(mockManager.save).toHaveBeenCalledTimes(3); // new question, new answers, deactivate old
      expect(result).toHaveProperty('id', 99);
    });

    it('should merge and save if no user_answers and no unsafe changes', async () => {
      const question = { ...baseQuestion, user_answers: [] };
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(question);

      const dto = {
        is_active: false,
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return await cb(mockManager);
        },
      );

      (mockManager.merge as jest.Mock).mockReturnValue({
        ...question,
        ...dto,
      });

      (mockManager.save as jest.Mock).mockResolvedValue({
        ...question,
        ...dto,
      });

      const result = await service.update(1, dto as any);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('is_active', false);
    });

    it('should throw general update_failed error on unexpected exception', async () => {
      const question = { ...baseQuestion };
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(question);

      (mockDataSource.transaction as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected DB error');
      });

      await expect(service.update(1, {} as any)).rejects.toThrow(
        'question.update_failed',
      );
    });

    it('should rethrow BadRequestException if thrown inside transaction', async () => {
      const question = { ...baseQuestion };
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(question);

      const expectedError = new BadRequestException('Some validation failed');

      (mockDataSource.transaction as jest.Mock).mockImplementation(async () => {
        throw expectedError;
      });

      await expect(service.update(1, {} as any)).rejects.toThrow(expectedError);
    });
  });
});
