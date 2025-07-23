import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { TestSession } from './entities/test_session.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { Answer } from '@/modules/answers/entities/answer.entity';
import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { SubmitTestSessionDto } from './dto/submit-test-session.dto';
import { TestSessionSerializer } from './serializers/test_session.serializer';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { DifficultyLevel } from '@/common/enums/question.enum';

import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';
import { Test } from '@/modules/tests/entities/test.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { TestSessionQuestionSerializer } from '../test_session_questions/serializers/test_session_question.serializer';
import { QuestionType } from '@/common/enums/question.enum';
import { GradeEssayDto, GradeEssayItemDto } from './dto/grade-essay.dto';

@Injectable()
export class TestSessionService extends BaseService {
  constructor(
    @InjectRepository(TestSession)
    private testSessionRepo: Repository<TestSession>,

    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,

    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,

    @InjectRepository(TestSessionQuestion)
    private sessionQuestionRepo: Repository<TestSessionQuestion>,

    @InjectRepository(Question)
    private questionRepo: Repository<Question>,

    @InjectDataSource()
    private dataSource: DataSource,

    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  /**
   * Tạo một phiên làm bài mới cho người dùng.
   * - Nếu đã có phiên đang làm thì trả về luôn (chưa hoàn thành).
   * - Lấy ngẫu nhiên câu hỏi theo mức độ (dễ/trung bình/khó).
   * - Trộn thứ tự câu hỏi và lưu vào bảng `test_session_question`.
   * - Snapshot các câu trả lời tại thời điểm tạo phiên.
   */
  async createSession(
    dto: CreateTestSessionDto,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    try {
      const session = await this.dataSource.transaction(async (manager) => {
        const sessionRepo = manager.getRepository(TestSession);
        const questionRepo = manager.getRepository(Question);
        const sessionQuestionRepo = manager.getRepository(TestSessionQuestion);

        // Kiểm tra xem người dùng đã có phiên làm bài chưa hoàn thành chưa
        const existingSession = await sessionRepo.findOne({
          where: {
            user_id: user.id,
            test_id: dto.testId,
            is_completed: false,
            status: TestSessionStatus.IN_PROGRESS,
          },
          lock: { mode: 'pessimistic_write' },
        });

        // Nếu đã có thì trả luôn
        if (existingSession) return existingSession;

        // Lấy thông tin bài test
        const test = await manager.getRepository(Test).findOneOrFail({
          where: { id: dto.testId },
        });

        /**
         * Hàm lấy câu hỏi ngẫu nhiên theo độ khó kèm đáp án
         * - Nếu không đủ số lượng yêu cầu thì báo lỗi
         */
        const fetchRandomQuestions = async (
          difficulty: string,
          count: number,
        ): Promise<Question[]> => {
          const availableCount = await questionRepo.count({
            where: {
              subject_id: test.subject_id,
              difficulty_level: difficulty,
              is_active: true,
            },
          });

          if (availableCount < count) {
            throw new BadRequestException(
              await this.t('test_question.not_enough_questions'),
            );
          }

          return questionRepo
            .createQueryBuilder('question')
            .leftJoinAndSelect('question.answers', 'answer')
            .where('question.subject_id = :subjectId', {
              subjectId: test.subject_id,
            })
            .andWhere('question.difficulty_level = :difficulty', { difficulty })
            .andWhere('question.is_active = true')
            .orderBy('RAND()')
            .take(count)
            .getMany();
        };

        // Gom các câu hỏi theo độ khó
        const allQuestions: Question[] = [];

        if (test.easy_question_count) {
          allQuestions.push(
            ...(await fetchRandomQuestions(
              DifficultyLevel.EASY,
              test.easy_question_count,
            )),
          );
        }

        if (test.medium_question_count) {
          allQuestions.push(
            ...(await fetchRandomQuestions(
              DifficultyLevel.MEDIUM,
              test.medium_question_count,
            )),
          );
        }

        if (test.hard_question_count) {
          allQuestions.push(
            ...(await fetchRandomQuestions(
              DifficultyLevel.HARD,
              test.hard_question_count,
            )),
          );
        }

        // Trộn thứ tự câu hỏi ngẫu nhiên
        const shuffled = allQuestions
          .map((q) => ({ q, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ q }) => q);

        // Tạo phiên làm bài
        const newSession = sessionRepo.create({
          test_id: dto.testId,
          user_id: user.id,
          started_at: new Date(),
          status: TestSessionStatus.IN_PROGRESS,
          is_completed: false,
        });

        const savedSession = await sessionRepo.save(newSession);

        // Tạo bản ghi câu hỏi cho từng câu hỏi trong phiên thi (snapshot đáp án)
        const sessionQuestions = shuffled.map((q, idx) => {
          const answersSnapshot =
            q.answers
              ?.filter((a) => a.is_active)
              .map((a) => ({
                id: a.id,
                answer_text: a.answer_text,
                is_correct: a.is_correct,
                explanation: a.explanation ?? null,
              })) ?? [];

          return sessionQuestionRepo.create({
            session_id: savedSession.id,
            question_id: q.id,
            order_number: idx + 1,
            answers_snapshot: answersSnapshot,
          });
        });

        await sessionQuestionRepo.save(sessionQuestions);

        return savedSession;
      });

      return plainToInstance(TestSessionSerializer, session, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.create_failed'));
    }
  }

  async submitSession(
    id: number,
    dto: SubmitTestSessionDto,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    try {
      const session = await this.testSessionRepo.findOne({
        where: { id },
        relations: ['test'],
      });

      if (!session)
        throw new NotFoundException(await this.t('test_session.not_found'));
      if (session.user_id !== user.id)
        throw new BadRequestException(
          await this.t('test_session.invalid_user'),
        );

      const sessionQuestions = await this.sessionQuestionRepo.find({
        where: { session_id: session.id },
        relations: ['question', 'question.answers'],
      });

      const allQuestionIds = sessionQuestions.map((sq) => sq.question.id);
      const sessionQuestionMap = new Map<number, TestSessionQuestion>();
      sessionQuestions.forEach((sq) =>
        sessionQuestionMap.set(sq.question.id, sq),
      );

      // Lấy thông tin câu hỏi để kiểm tra loại câu hỏi
      const questions = await this.questionRepo.find({
        where: { id: In(allQuestionIds) },
      });
      const questionMap = new Map<number, Question>();
      questions.forEach((q) => questionMap.set(q.id, q));

      let totalScore = 0;
      const userAnswersToSave: UserAnswer[] = [];
      const answeredQuestions = new Set<number>();

      for (const item of dto.answers) {
        const question = questionMap.get(item.questionId);
        if (!question || answeredQuestions.has(item.questionId)) continue;

        // Xử lý câu hỏi trắc nghiệm
        if (question.question_type === QuestionType.MULTIPLE_CHOICE) {
          const answer = await this.answerRepo.findOne({
            where: { id: item.answerId, question_id: item.questionId },
          });

          if (!answer) continue;

          const isCorrect = answer.is_correct;
          const points = isCorrect ? (question.points ?? 0) : 0;

          userAnswersToSave.push(
            this.userAnswerRepo.create({
              session_id: session.id,
              question_id: item.questionId,
              answer_id: item.answerId,
              is_correct: isCorrect,
              points_earned: points,
            }),
          );

          if (isCorrect) totalScore += points;
        }
        // Xử lý câu hỏi tự luận
        else if (question.question_type === QuestionType.ESSAY) {
          userAnswersToSave.push(
            this.userAnswerRepo.create({
              session_id: session.id,
              question_id: item.questionId,
              answer_text: item.answer_text,
              is_correct: false, // Mặc định là false, chờ giáo viên chấm
              points_earned: 0, // Mặc định 0 điểm, chờ giáo viên chấm
            }),
          );
        }

        answeredQuestions.add(item.questionId);
      }

      // Các câu không làm thì coi như sai
      for (const qid of allQuestionIds) {
        if (answeredQuestions.has(qid)) continue;

        const question = questionMap.get(qid);
        const isEssay = question?.question_type === QuestionType.ESSAY;

        userAnswersToSave.push(
          this.userAnswerRepo.create({
            session_id: session.id,
            question_id: qid,
            answer_id: null,
            answer_text: isEssay ? '' : undefined,
            is_correct: false,
            points_earned: 0,
          }),
        );
      }

      // Cập nhật trạng thái phiên thi
      session.score = totalScore;
      session.is_completed = true;
      const hasEssay = questions.some(
        (q) => q.question_type === QuestionType.ESSAY,
      );
      session.auto_graded = !hasEssay;
      session.status = hasEssay
        ? TestSessionStatus.SUBMITTED
        : TestSessionStatus.GRADED;

      session.submitted_at = new Date();
      session.time_spent = Math.floor(
        (Date.now() - session.started_at.getTime()) / 1000,
      );

      await this.dataSource.transaction(async (manager) => {
        await manager.save(UserAnswer, userAnswersToSave);
        await manager.save(TestSession, session);
      });

      return plainToInstance(TestSessionSerializer, session, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.submit_failed'));
    }
  }

  /**
   * Lấy chi tiết một phiên thi (dành cho user, không dùng snapshot).
   */
  async getSessionById(
    id: number,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    const session = await this.testSessionRepo.findOne({
      where: { id, user_id: user.id },
      relations: [
        'test',
        'user_answers',
        'user_answers.question',
        'user_answers.answer',
        'user_answers.question.answers',
      ],
    });

    if (!session)
      throw new NotFoundException(
        await this.t('test_session.not_found_or_unauthorized'),
      );

    // Lọc ra các câu hỏi và đáp án còn hoạt động
    session.user_answers = session.user_answers?.filter(
      (ua) =>
        ua.question?.is_active && (ua.answer === null || ua.answer?.is_active),
    );

    for (const ua of session.user_answers ?? []) {
      if (ua.question?.answers) {
        ua.question.answers = ua.question.answers.filter((a) => a.is_active);
      }
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * ADMIN: Lấy danh sách tất cả phiên làm bài của toàn bộ người dùng.
   */
  async getAllSessionsForAdmin(): Promise<TestSessionSerializer[]> {
    const sessions = await this.testSessionRepo.find({
      relations: ['test', 'user', 'user_answers'],
      order: { submitted_at: 'DESC' },
    });

    return plainToInstance(TestSessionSerializer, sessions, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy lịch sử các phiên làm bài của user hiện tại.
   */
  async getSessionHistory(user: {
    id: number;
  }): Promise<TestSessionSerializer[]> {
    const sessions = await this.testSessionRepo.find({
      where: { user_id: user.id },
      relations: ['test', 'user_answers', 'user_answers.question'],
      order: { submitted_at: 'DESC' },
    });

    return plainToInstance(TestSessionSerializer, sessions, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * ADMIN: Xem chi tiết phiên làm bài (dùng snapshot).
   */
  async getSessionDetailRawByAdmin(
    sessionId: number,
  ): Promise<TestSessionSerializer> {
    const session = await this.testSessionRepo.findOne({
      where: { id: sessionId },
      relations: [
        'test',
        'user',
        'test_session_questions',
        'test_session_questions.question',
        'user_answers',
        'user_answers.answer',
      ],
    });

    if (!session)
      throw new NotFoundException(await this.t('test_session.not_found'));

    const answerMap = new Map<number, UserAnswer>();
    for (const ua of session.user_answers) {
      answerMap.set(ua.question_id, ua);
    }

    for (const tsq of session.test_session_questions) {
      (tsq.question as any).answers = tsq.answers_snapshot ?? [];
      const userAnswer = answerMap.get(tsq.question_id);
      (tsq as any).user_answer = userAnswer ?? null;
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * USER: Xem chi tiết phiên làm bài của chính mình (dùng snapshot).
   */
  async getSessionDetailRawByUser(
    sessionId: number,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    const session = await this.testSessionRepo.findOne({
      where: {
        id: sessionId,
        user_id: user.id,
      },
      relations: [
        'test',
        'test_session_questions',
        'test_session_questions.question',
        'user_answers',
        'user_answers.answer',
      ],
    });

    if (!session)
      throw new NotFoundException(
        await this.t('test_session.not_found_or_unauthorized'),
      );

    const answerMap = new Map<number, UserAnswer>();
    for (const ua of session.user_answers) {
      answerMap.set(ua.question_id, ua);
    }

    for (const tsq of session.test_session_questions) {
      (tsq.question as any).answers = tsq.answers_snapshot ?? [];
      const userAnswer = answerMap.get(tsq.question_id);
      (tsq as any).user_answer = userAnswer ?? null;
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }

  async getSessionQuestions(
    sessionId: number,
  ): Promise<TestSessionQuestionSerializer[]> {
    const sessionQuestions = await this.sessionQuestionRepo.find({
      where: { session_id: sessionId },
      relations: ['question'],
      order: { order_number: 'ASC' },
    });

    if (!sessionQuestions.length) {
      throw new NotFoundException(
        await this.t('test_session.questions_not_found'),
      );
    }
    return plainToInstance(TestSessionQuestionSerializer, sessionQuestions, {
      excludeExtraneousValues: true,
    });
  }

  async gradeEssayAnswers(
    sessionId: number,
    dto: GradeEssayDto,
    graderId: number,
  ): Promise<TestSessionSerializer> {
    const session = await this.testSessionRepo.findOne({
      where: { id: sessionId },
      relations: ['user_answers', 'user_answers.question'],
    });

    if (!session) {
      throw new NotFoundException(await this.t('test_session.not_found'));
    }

    const updatesMap = new Map<number, GradeEssayItemDto>();
    dto.updates.forEach((item) => updatesMap.set(item.questionId, item));

    let totalScore = 0;

    for (const ua of session.user_answers) {
      if (
        ua.question.question_type === QuestionType.ESSAY &&
        updatesMap.has(ua.question_id)
      ) {
        const update = updatesMap.get(ua.question_id)!;
        ua.points_earned = update.points;
        if (typeof update.isCorrect === 'boolean') {
          ua.is_correct = update.isCorrect;
        }
        ua.graded_at = new Date();
        ua.grader_id = graderId;

        await this.userAnswerRepo.save(ua);
      }

      // Tính tổng điểm cho tất cả user_answer có chấm điểm
      if (ua.points_earned != null) {
        totalScore += ua.points_earned;
      }
    }
    session.score = totalScore;
    session.auto_graded = false;
    session.status = TestSessionStatus.GRADED;
    await this.testSessionRepo.save(session);

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }
}
