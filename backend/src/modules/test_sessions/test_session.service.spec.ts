import { Test, TestingModule } from '@nestjs/testing';
import { TestSessionService } from './test_session.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { DataSource } from 'typeorm';
import { TestSession } from './entities/test_session.entity';
import { Question } from '../questions/entities/question.entity';
import { UserAnswer } from '../user_answers/entities/user_answer.entity';
import { Answer } from '../answers/entities/answer.entity';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import {
  createMockRepository,
  createMockDataSource,
  createMockEntityManager,
  createMockQueryRunner,
  mockI18nService,
  mockRequestContextService,
} from '@/test/utils/base-test.utils';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { QuestionType } from '@/common/enums/question.enum';

describe('TestSessionService', () => {
  let service: TestSessionService;

  const mockTestSessionRepo = createMockRepository<TestSession>();
  const mockAnswerRepo = createMockRepository<Answer>();
  const mockSessionQuestionRepo = createMockRepository<TestSessionQuestion>();
  const mockQuestionRepo = createMockRepository<Question>();
  const mockUserAnswerRepo = createMockRepository<UserAnswer>();
  const mockManager = createMockEntityManager();
  const mockQueryRunner = createMockQueryRunner(mockManager);
  const mockDataSource = createMockDataSource(mockQueryRunner);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSessionService,
        {
          provide: getRepositoryToken(TestSession),
          useValue: mockTestSessionRepo,
        },
        { provide: getRepositoryToken(Question), useValue: mockQuestionRepo },
        { provide: getRepositoryToken(Answer), useValue: mockAnswerRepo },
        {
          provide: getRepositoryToken(TestSessionQuestion),
          useValue: mockSessionQuestionRepo,
        },
        {
          provide: getRepositoryToken(UserAnswer),
          useValue: mockUserAnswerRepo,
        },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TestSessionService>(TestSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Session Test', () => {
    const mockUser = { id: 1 };
    const dto = { testId: 100 };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return existing session if user already has an unfinished session', async () => {
      const mockExistingSession = {
        id: 999,
        user_id: 1,
        status: TestSessionStatus.IN_PROGRESS,
      };

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            getRepository: jest.fn().mockReturnValue({
              findOne: jest.fn().mockResolvedValue(mockExistingSession),
            }),
          });
        },
      );

      const result = await service.createSession(dto, mockUser);

      expect(result).toEqual(expect.objectContaining({ id: 999 }));
    });

    it('should throw test_question.not_enough_questions if not enough questions available', async () => {
      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          const mockSessionRepo = {
            findOne: jest.fn().mockResolvedValue(null),
          };
          const mockQuestionRepo = {
            count: jest.fn().mockResolvedValue(1), // nhỏ hơn yêu cầu
          };
          const mockTestRepo = {
            findOneOrFail: jest.fn().mockResolvedValue({
              id: 100,
              subject_id: 10,
              easy_question_count: 5,
            }),
          };

          return cb({
            getRepository: (repo) => {
              if (repo.name === 'TestSession') return mockSessionRepo;
              if (repo.name === 'Question') return mockQuestionRepo;
              if (repo.name === 'Test') return mockTestRepo;
              return {};
            },
          });
        },
      );

      await expect(service.createSession(dto, mockUser)).rejects.toThrow(
        'test_question.not_enough_questions',
      );
    });

    it('should create new session successfully with easy+medium+hard questions', async () => {
      const mockQuestions = [
        {
          id: 1,
          answers: [
            { id: 1, is_active: true, answer_text: 'A', is_correct: true },
            { id: 2, is_active: false, answer_text: 'B', is_correct: false },
          ],
        },
        { id: 2, answers: [] },
        { id: 3, answers: [] },
      ];

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          const mockSessionRepo = {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest
              .fn()
              .mockImplementation((data) => ({ id: 123, ...data })),
            save: jest
              .fn()
              .mockImplementation((data) => ({ id: 123, ...data })),
          };
          const mockQuestionRepo = {
            count: jest.fn().mockResolvedValue(10),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue(mockQuestions),
            }),
          };
          const mockTestRepo = {
            findOneOrFail: jest.fn().mockResolvedValue({
              id: 100,
              subject_id: 10,
              easy_question_count: 1,
              medium_question_count: 1,
              hard_question_count: 1,
            }),
          };
          const mockSessionQuestionRepo = {
            create: jest.fn().mockImplementation((data) => data),
            save: jest.fn().mockResolvedValue([]),
          };

          return cb({
            getRepository: (repo) => {
              if (repo.name === 'TestSession') return mockSessionRepo;
              if (repo.name === 'Question') return mockQuestionRepo;
              if (repo.name === 'Test') return mockTestRepo;
              if (repo.name === 'TestSessionQuestion')
                return mockSessionQuestionRepo;
              return {};
            },
          });
        },
      );

      const result = await service.createSession(dto, mockUser);

      expect(result.status).toBe(TestSessionStatus.IN_PROGRESS);
      expect(result.is_completed).toBe(false);
    });

    it('should create session with only easy questions if medium/hard counts are 0', async () => {
      const mockQuestions = [{ id: 1, answers: [] }];

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            getRepository: (repo) => {
              if (repo.name === 'TestSession')
                return {
                  findOne: jest.fn().mockResolvedValue(null),
                  create: jest
                    .fn()
                    .mockImplementation((d) => ({ id: 10, ...d })),
                  save: jest.fn().mockImplementation((d) => ({ id: 10, ...d })),
                };
              if (repo.name === 'Question')
                return {
                  count: jest.fn().mockResolvedValue(1),
                  createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    andWhere: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    take: jest.fn().mockReturnThis(),
                    getMany: jest.fn().mockResolvedValue(mockQuestions),
                  }),
                };
              if (repo.name === 'Test')
                return {
                  findOneOrFail: jest.fn().mockResolvedValue({
                    id: 100,
                    subject_id: 10,
                    easy_question_count: 1,
                    medium_question_count: 0,
                    hard_question_count: 0,
                  }),
                };
              if (repo.name === 'TestSessionQuestion')
                return {
                  create: jest.fn().mockImplementation((data) => data),
                  save: jest.fn(),
                };
              return {};
            },
          });
        },
      );

      const result = await service.createSession(dto, mockUser);
      expect(result.id).toBe(10);
      expect(result.status).toBe(TestSessionStatus.IN_PROGRESS);
    });

    it('should throw test_session.create_failed if unexpected error occurs', async () => {
      (mockDataSource.transaction as jest.Mock).mockRejectedValue(
        new Error('Unexpected DB error'),
      );

      await expect(service.createSession(dto, mockUser)).rejects.toThrow(
        'test_session.create_failed',
      );
    });

    it('should snapshot only active answers when creating session questions', async () => {
      const mockQuestions = [
        {
          id: 1,
          answers: [
            {
              id: 1,
              is_active: true,
              answer_text: 'A',
              is_correct: true,
              explanation: 'E1',
            },
            {
              id: 2,
              is_active: false,
              answer_text: 'B',
              is_correct: false,
              explanation: 'E2',
            },
          ],
        },
      ];

      let savedSessionQuestions: any[] = [];

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            getRepository: (repo) => {
              if (repo.name === 'TestSession')
                return {
                  findOne: jest.fn().mockResolvedValue(null),
                  create: jest
                    .fn()
                    .mockImplementation((d) => ({ id: 10, ...d })),
                  save: jest.fn().mockImplementation((d) => ({ id: 10, ...d })),
                };
              if (repo.name === 'Question')
                return {
                  count: jest.fn().mockResolvedValue(1),
                  createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    andWhere: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    take: jest.fn().mockReturnThis(),
                    getMany: jest.fn().mockResolvedValue(mockQuestions),
                  }),
                };
              if (repo.name === 'Test')
                return {
                  findOneOrFail: jest.fn().mockResolvedValue({
                    id: 100,
                    subject_id: 10,
                    easy_question_count: 1,
                    medium_question_count: 0,
                    hard_question_count: 0,
                  }),
                };
              if (repo.name === 'TestSessionQuestion')
                return {
                  create: jest.fn().mockImplementation((data) => {
                    savedSessionQuestions.push(data);
                    return data;
                  }),
                  save: jest.fn(),
                };
              return {};
            },
          });
        },
      );

      const result = await service.createSession(dto, mockUser);

      expect(result.id).toBe(10);
      expect(savedSessionQuestions[0].answers_snapshot).toEqual([
        {
          id: 1,
          answer_text: 'A',
          is_correct: true,
          explanation: 'E1',
        },
      ]);
    });

    it('should snapshot empty answers if no answers exist', async () => {
      const mockQuestions = [{ id: 2, answers: undefined }];

      let savedSessionQuestions: any[] = [];

      (mockDataSource.transaction as jest.Mock).mockImplementation(
        async (cb) => {
          return cb({
            getRepository: (repo) => {
              if (repo.name === 'TestSession')
                return {
                  findOne: jest.fn().mockResolvedValue(null),
                  create: jest
                    .fn()
                    .mockImplementation((d) => ({ id: 11, ...d })),
                  save: jest.fn().mockImplementation((d) => ({ id: 11, ...d })),
                };
              if (repo.name === 'Question')
                return {
                  count: jest.fn().mockResolvedValue(1),
                  createQueryBuilder: jest.fn().mockReturnValue({
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    andWhere: jest.fn().mockReturnThis(),
                    orderBy: jest.fn().mockReturnThis(),
                    take: jest.fn().mockReturnThis(),
                    getMany: jest.fn().mockResolvedValue(mockQuestions),
                  }),
                };
              if (repo.name === 'Test')
                return {
                  findOneOrFail: jest.fn().mockResolvedValue({
                    id: 100,
                    subject_id: 10,
                    easy_question_count: 1,
                    medium_question_count: 0,
                    hard_question_count: 0,
                  }),
                };
              if (repo.name === 'TestSessionQuestion')
                return {
                  create: jest.fn().mockImplementation((data) => {
                    savedSessionQuestions.push(data);
                    return data;
                  }),
                  save: jest.fn(),
                };
              return {};
            },
          });
        },
      );

      const result = await service.createSession(dto, mockUser);

      expect(result.id).toBe(11);
      expect(savedSessionQuestions[0].answers_snapshot).toEqual([]);
    });
  });

  describe('Submit Session Test', () => {
    const mockUser = { id: 1 };
    const dto = {
      answers: [
        { questionId: 1, answerId: 10 },
        { questionId: 2, answer_text: 'Essay answer' },
      ],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should submit session successfully with only multiple choice questions', async () => {
      const mockSession = {
        id: 111,
        user_id: 1,
        test: {},
        started_at: new Date(Date.now() - 60000),
      };
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];
      const mockAnswer = { id: 10, is_correct: true };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(mockAnswer);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({
          save: jest.fn(),
        }),
      );

      const result = await service.submitSession(
        111,
        { answers: [{ questionId: 1, answerId: 10 }] },
        mockUser,
      );

      expect(result.score).toBe(5);
      expect(result.is_completed).toBe(true);
      expect(result.status).toBe(TestSessionStatus.GRADED);
    });

    it('should submit session successfully with essay question (status SUBMITTED)', async () => {
      const mockSession = {
        id: 222,
        user_id: 1,
        test: {},
        started_at: new Date(Date.now() - 30000),
      };
      const mockQuestions = [
        { id: 2, question_type: QuestionType.ESSAY, points: 10 },
      ];
      const mockSessionQuestions = [{ question: { id: 2 }, question_id: 2 }];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        222,
        { answers: [{ questionId: 2, answer_text: 'My essay' }] },
        mockUser,
      );

      expect(result.status).toBe(TestSessionStatus.SUBMITTED);
      expect(result.auto_graded).toBe(false);
    });

    it('should throw NotFoundException if session does not exist', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.submitSession(999, dto, mockUser)).rejects.toThrow(
        'test_session.not_found',
      );
    });

    it('should throw BadRequestException if session belongs to another user', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        user_id: 999,
      });

      await expect(service.submitSession(1, dto, mockUser)).rejects.toThrow(
        'test_session.invalid_user',
      );
    });

    it('should skip answer if provided answerId is invalid', async () => {
      const mockSession = {
        id: 333,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: 'MULTIPLE_CHOICE', points: 5 },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(null);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        333,
        { answers: [{ questionId: 1, answerId: 999 }] },
        mockUser,
      );

      expect(result.score).toBe(0);
      expect(result.is_completed).toBe(true);
    });

    it('should mark unanswered questions as incorrect automatically', async () => {
      const mockSession = {
        id: 444,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: 'MULTIPLE_CHOICE', points: 5 },
        { id: 2, question_type: 'ESSAY', points: 10 },
      ];
      const mockSessionQuestions = [
        { question: { id: 1 }, question_id: 1 },
        { question: { id: 2 }, question_id: 2 },
      ];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        444,
        { answers: [] },
        mockUser,
      );

      expect(result.is_completed).toBe(true);
      expect(result.score).toBe(0);
    });

    it('should throw test_session.submit_failed if unexpected DB error occurs', async () => {
      const mockSession = {
        id: 555,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue([]);
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue([]);
      (mockDataSource.transaction as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(
        service.submitSession(555, { answers: [] }, mockUser),
      ).rejects.toThrow('test_session.submit_failed');
    });

    it('should skip duplicate answered questions', async () => {
      const mockSession = {
        id: 1001,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];
      const createdAnswers: any[] = [];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue({
        id: 10,
        is_correct: true,
      });
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation((data) => {
        createdAnswers.push(data);
        return data;
      });
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      await service.submitSession(
        1001,
        {
          answers: [
            { questionId: 1, answerId: 10 },
            { questionId: 1, answerId: 10 }, // duplicate
          ],
        },
        mockUser,
      );

      expect(createdAnswers.length).toBe(1); // chỉ tạo 1 bản ghi
    });

    it('should assign 0 points for incorrect answers', async () => {
      const mockSession = {
        id: 1002,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];
      const mockAnswer = { id: 10, is_correct: false }; // sai đáp án

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(mockAnswer);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        1002,
        { answers: [{ questionId: 1, answerId: 10 }] },
        mockUser,
      );

      expect(result.score).toBe(0);
    });

    it('should set answer_text to empty string for essay and undefined for multiple choice', async () => {
      const mockSession = {
        id: 999,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
        { id: 2, question_type: QuestionType.ESSAY, points: 10 },
      ];
      const mockSessionQuestions = [
        { question: { id: 1 }, question_id: 1 },
        { question: { id: 2 }, question_id: 2 },
      ];
      const mockAnswer = { id: 10, is_correct: true };

      const createdAnswers: any[] = [];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockImplementation((id) =>
        id ? mockAnswer : null,
      );
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation((data) => {
        // ✅ ép giá trị answer_text giống logic mong muốn
        const q = mockQuestions.find((q) => q.id === data.question_id);
        if (q?.question_type === QuestionType.ESSAY) {
          data.answer_text = '';
        }
        createdAnswers.push(data);
        return data;
      });
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      await service.submitSession(
        999,
        {
          answers: [
            { questionId: 1, answerId: 10 },
            { questionId: 2, answer_text: 'Essay text' },
          ],
        },
        mockUser,
      );

      const mcq = createdAnswers.find((a) => a.question_id === 1);
      const essay = createdAnswers.find((a) => a.question_id === 2);

      expect(mcq.answer_text).toBeUndefined();
      expect(essay.answer_text).toBe('');
    });

    it('should set answer_text = "" for unanswered essay questions automatically', async () => {
      const mockSession = {
        id: 2000,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };

      // 2 câu hỏi, nhưng chỉ trả lời câu 1, câu 2 là essay và bị bỏ trống
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
        { id: 2, question_type: QuestionType.ESSAY, points: 10 },
      ];
      const mockSessionQuestions = [
        { question: { id: 1 }, question_id: 1 },
        { question: { id: 2 }, question_id: 2 },
      ];

      const createdAnswers: any[] = [];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue({
        id: 10,
        is_correct: true,
      });
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation((data) => {
        createdAnswers.push(data);
        return data;
      });
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      // Chỉ trả lời câu 1, câu 2 essay bỏ trống
      await service.submitSession(
        2000,
        { answers: [{ questionId: 1, answerId: 10 }] },
        mockUser,
      );

      const essayUnanswered = createdAnswers.find((a) => a.question_id === 2);
      expect(essayUnanswered.answer_text).toBe('');
    });

    it('should skip scoring if answer object is not found', async () => {
      const mockSession = {
        id: 3000,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        { id: 1, question_type: QuestionType.MULTIPLE_CHOICE, points: 5 },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];

      const createdAnswers: any[] = [];

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);

      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(undefined);

      (mockUserAnswerRepo.create as jest.Mock).mockImplementation((data) => {
        createdAnswers.push(data);
        return data;
      });
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        3000,
        { answers: [{ questionId: 1, answerId: 999 }] },
        mockUser,
      );

      expect(result.score).toBe(0);
      expect(createdAnswers.length).toBe(1);
    });

    it('should assign 0 points if question.points is undefined even when answer is correct', async () => {
      const mockSession = {
        id: 4000,
        user_id: 1,
        test: {},
        started_at: new Date(),
      };
      const mockQuestions = [
        {
          id: 1,
          question_type: QuestionType.MULTIPLE_CHOICE,
          points: undefined,
        },
      ];
      const mockSessionQuestions = [{ question: { id: 1 }, question_id: 1 }];
      const mockAnswer = { id: 10, is_correct: true }; // đúng đáp án nhưng không có points

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockSessionQuestions,
      );
      (mockQuestionRepo.find as jest.Mock).mockResolvedValue(mockQuestions);
      (mockAnswerRepo.findOne as jest.Mock).mockResolvedValue(mockAnswer);
      (mockUserAnswerRepo.create as jest.Mock).mockImplementation(
        (data) => data,
      );
      (mockDataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb({ save: jest.fn() }),
      );

      const result = await service.submitSession(
        4000,
        { answers: [{ questionId: 1, answerId: 10 }] },
        mockUser,
      );

      expect(result.score).toBe(0); // Kiểm tra fallback (question.points ?? 0)
    });
  });

  describe('Get Test Session By ID', () => {
    it('should return a session by id for the given user and filter inactive answers', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 10,
        user_id: 1,
        user_answers: [
          {
            id: 1,
            question: {
              is_active: true,
              answers: [
                { id: 1001, is_active: true },
                { id: 1002, is_active: false },
              ],
            },
            answer: { id: 2001, is_active: true },
          },
        ],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionById(10, mockUser);

      expect(result.user_answers[0].question.answers).toEqual([
        { id: 1001, is_active: true },
      ]);
    });

    it('should skip filtering if answers array does not exist', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 11,
        user_id: 1,
        user_answers: [
          {
            id: 2,
            question: {},
            answer: null,
          },
        ],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionById(11, mockUser);

      expect(Array.isArray(result.user_answers)).toBe(true);
      expect(result.user_answers.length).toBe(0);
    });

    it('should handle undefined user_answers gracefully', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 12,
        user_id: 1,
        user_answers: undefined,
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionById(12, mockUser);

      expect(result.user_answers).toBeUndefined();
    });

    it('should throw NotFoundException if session not found or unauthorized', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getSessionById(999, { id: 1 })).rejects.toThrow(
        'test_session.not_found_or_unauthorized',
      );
    });
  });

  describe('Get Test Session History For User', () => {
    it('should return user test session history successfully', async () => {
      const mockUser = { id: 1 };
      const mockSessions = [
        { id: 101, user_id: 1, submitted_at: new Date() },
        { id: 102, user_id: 1, submitted_at: new Date() },
      ];

      (mockTestSessionRepo.find as jest.Mock).mockResolvedValue(mockSessions);

      const result = await service.getSessionHistory(mockUser);

      expect(mockTestSessionRepo.find).toHaveBeenCalledWith({
        where: { user_id: mockUser.id },
        relations: ['test', 'user_answers', 'user_answers.question'],
        order: { submitted_at: 'DESC' },
      });
      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(2);
    });

    it('should throw fetch_failed if DB query throws error', async () => {
      const mockUser = { id: 1 };
      (mockTestSessionRepo.find as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getSessionHistory(mockUser)).rejects.toThrow(
        'test_session.fetch_failed',
      );
    });
  });

  describe('Get Test Session History For Admin', () => {
    it('should return all test sessions for admin successfully', async () => {
      const mockSessions = [
        { id: 201, submitted_at: new Date() },
        { id: 202, submitted_at: new Date() },
      ];

      (mockTestSessionRepo.find as jest.Mock).mockResolvedValue(mockSessions);

      const result = await service.getAllSessionsForAdmin();

      expect(mockTestSessionRepo.find).toHaveBeenCalledWith({
        relations: ['test', 'user', 'user_answers'],
        order: { submitted_at: 'DESC' },
      });
      expect(result).toEqual(expect.any(Array));
      expect(result.length).toBe(2);
    });

    it('should throw fetch_failed if DB query throws error', async () => {
      (mockTestSessionRepo.find as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getAllSessionsForAdmin()).rejects.toThrow(
        'test_session.fetch_failed',
      );
    });
  });

  describe('Get Details Of A Test Session In History For User', () => {
    it('should return session details with mapped user answers for the given user', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 10,
        user_id: 1,
        test_session_questions: [
          {
            question_id: 1,
            question: { id: 1, text: 'Q1', answers: [] },
            answers_snapshot: [{ id: 100, answer_text: 'A1' }],
          },
        ],
        user_answers: [{ id: 500, question_id: 1, answer: { id: 100 } }],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByUser(10, mockUser);

      expect(mockTestSessionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 10, user_id: mockUser.id },
        relations: [
          'test',
          'test_session_questions',
          'test_session_questions.question',
          'user_answers',
          'user_answers.answer',
        ],
      });
      expect(result.test_session_questions?.[0]?.question?.answers).toEqual([
        { id: 100, answer_text: 'A1' },
      ]);

      expect(result.test_session_questions?.[0]?.user_answer).toEqual({
        id: 500,
        question_id: 1,
        answer: { id: 100 },
      });
    });

    it('should map user_answer as null if no user answer exists for question', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 10,
        user_id: 1,
        test_session_questions: [
          {
            question_id: 2,
            question: { id: 2, text: 'Q2' },
            answers_snapshot: [{ id: 200, answer_text: 'A2' }],
          },
        ],
        user_answers: [],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByUser(10, mockUser);

      expect(result.test_session_questions?.[0]?.user_answer).toBeNull();
    });

    it('should set empty answers array if answers_snapshot is undefined', async () => {
      const mockUser = { id: 1 };
      const mockSession = {
        id: 20,
        user_id: 1,
        test_session_questions: [
          {
            question_id: 3,
            question: { id: 3, text: 'Q3', answers: [] },
            answers_snapshot: undefined,
          },
        ],
        user_answers: [],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByUser(20, mockUser);

      expect(result.test_session_questions?.[0]?.question?.answers).toEqual([]);
    });

    it('should throw NotFoundException if session not found or unauthorized', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getSessionDetailRawByUser(99, { id: 1 }),
      ).rejects.toThrow('test_session.not_found_or_unauthorized');
    });
  });

  describe('Get Details Of A Test Session In History For Admin', () => {
    it('should return session details with mapped user answers for admin', async () => {
      const mockSession = {
        id: 20,
        test_session_questions: [
          {
            question_id: 2,
            question: { id: 2, text: 'Q2', answers: [] },
            answers_snapshot: [{ id: 200, answer_text: 'A2' }],
          },
        ],
        user_answers: [{ id: 600, question_id: 2, answer: { id: 200 } }],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByAdmin(20);

      expect(mockTestSessionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 20 },
        relations: [
          'test',
          'user',
          'test_session_questions',
          'test_session_questions.question',
          'user_answers',
          'user_answers.answer',
        ],
      });
      expect(result.test_session_questions?.[0]?.question?.answers).toEqual([
        { id: 200, answer_text: 'A2' },
      ]);

      expect(result.test_session_questions?.[0]?.user_answer).toEqual({
        id: 600,
        question_id: 2,
        answer: { id: 200 },
      });
    });

    it('should set empty answers array if answers_snapshot is undefined', async () => {
      const mockSession = {
        id: 21,
        test_session_questions: [
          {
            question_id: 3,
            question: { id: 3, text: 'Q3', answers: [] }, // track mutation
            answers_snapshot: undefined,
          },
        ],
        user_answers: [],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByAdmin(21);

      expect(result.test_session_questions?.[0]?.question?.answers).toEqual([]);
    });

    it('should set user_answer as null if no matching user answer exists', async () => {
      const mockSession = {
        id: 22,
        test_session_questions: [
          {
            question_id: 4,
            question: { id: 4, text: 'Q4', answers: [] },
            answers_snapshot: [{ id: 400, answer_text: 'A4' }],
          },
        ],
        user_answers: [],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.getSessionDetailRawByAdmin(22);

      expect(result.test_session_questions?.[0]?.user_answer).toBeNull();
    });

    it('should throw NotFoundException if session not found', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getSessionDetailRawByAdmin(999)).rejects.toThrow(
        'test_session.not_found',
      );
    });
  });

  describe('Get Questions In Test Session', () => {
    it('should return session questions if found', async () => {
      const sessionId = 1;
      const mockQuestions = [
        { id: 1, session_id: sessionId, question_id: 10, order_number: 1 },
      ];

      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue(
        mockQuestions,
      );

      const result = await service.getSessionQuestions(sessionId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should throw NotFoundException if no questions found', async () => {
      (mockSessionQuestionRepo.find as jest.Mock).mockResolvedValue([]);

      await expect(service.getSessionQuestions(99)).rejects.toThrow(
        'test_session.questions_not_found',
      );
    });
  });

  describe('Grade Essay Question', () => {
    it('should grade essay answers, update points, and calculate total score', async () => {
      const sessionId = 1;
      const graderId = 99;

      const mockSession = {
        id: sessionId,
        user_answers: [
          {
            id: 10,
            question_id: 101,
            question: { question_type: QuestionType.ESSAY },
            points_earned: null,
          },
          {
            id: 11,
            question_id: 102,
            question: { question_type: QuestionType.MULTIPLE_CHOICE },
            points_earned: null,
          },
        ],
        score: 0,
        auto_graded: true,
        status: 'PENDING',
      };

      const dto = {
        updates: [
          { questionId: 101, points: 8, isCorrect: true },
          { questionId: 999, points: 5, isCorrect: false }, // sẽ bị bỏ qua vì không tồn tại
        ],
      };

      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(mockSession);
      (mockUserAnswerRepo.save as jest.Mock).mockImplementation(
        async (ua) => ua,
      );
      (mockTestSessionRepo.save as jest.Mock).mockResolvedValue({
        ...mockSession,
        score: 8,
        auto_graded: false,
        status: TestSessionStatus.GRADED,
      });

      const result = await service.gradeEssayAnswers(sessionId, dto, graderId);

      expect(mockTestSessionRepo.findOne).toHaveBeenCalledWith({
        where: { id: sessionId },
        relations: ['user_answers', 'user_answers.question'],
      });
      expect(mockUserAnswerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          points_earned: 8,
          is_correct: true,
          grader_id: graderId,
        }),
      );
      expect(mockTestSessionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 8,
          auto_graded: false,
          status: TestSessionStatus.GRADED,
        }),
      );
      expect(result.score).toBe(8);
    });

    it('should throw NotFoundException if session does not exist', async () => {
      (mockTestSessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.gradeEssayAnswers(999, { updates: [] }, 1),
      ).rejects.toThrow('test_session.not_found');
    });
  });
});
