import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { TestSession } from './entities/test_session.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { Answer } from '@/modules/answers/entities/answer.entity';
import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { SubmitTestSessionDto } from './dto/submit-test-session.dto';
import { plainToInstance } from 'class-transformer';
import { TestSessionSerializer } from './serializers/test_session.serializer';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { TestQuestion } from '../test_questions/entities/test_question.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';

@Injectable()
export class TestSessionService extends BaseService {
  constructor(
    @InjectRepository(TestSession)
    private testSessionRepo: Repository<TestSession>,

    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,

    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,

    @InjectDataSource()
    private dataSource: DataSource,

    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  /**
   * Tạo một phiên làm bài mới (nếu chưa tồn tại).
   */
  async createSession(
    dto: CreateTestSessionDto,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    try {
      const session = await this.dataSource.transaction(async (manager) => {
        const sessionRepo = manager.getRepository(TestSession);

        const existingSession = await sessionRepo.findOne({
          where: {
            user_id: user.id,
            test_id: dto.testId,
            is_completed: false,
            status: TestSessionStatus.IN_PROGRESS,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (existingSession) return existingSession;

        const newSession = sessionRepo.create({
          test_id: dto.testId,
          user_id: user.id,
          started_at: new Date(),
          status: TestSessionStatus.IN_PROGRESS,
          is_completed: false,
        });

        return await sessionRepo.save(newSession);
      });

      return plainToInstance(TestSessionSerializer, session, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.create_failed'));
    }
  }

  /**
   * Nộp bài thi, chấm điểm tự động và lưu snapshot.
   */
  async submitSession(
    id: number,
    dto: SubmitTestSessionDto,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    try {
      const session = await this.testSessionRepo.findOneBy({ id });
      if (!session) {
        throw new NotFoundException(await this.t('test_session.not_found'));
      }

      if (session.user_id !== user.id) {
        throw new BadRequestException(
          await this.t('test_session.invalid_user'),
        );
      }

      // Lấy danh sách câu hỏi đang active của đề thi
      const testQuestions = await this.dataSource
        .getRepository(TestQuestion)
        .find({
          where: {
            test_id: session.test_id,
            question: { is_active: true },
          },
          relations: ['question', 'question.answers'],
        });

      const allQuestions = testQuestions.map((tq) => tq.question);
      const allQuestionIds = allQuestions.map((q) => q.id);

      // Lấy danh sách đáp án người dùng đã chọn, chỉ lấy những đáp án active
      const answers = await this.answerRepo.find({
        where: {
          id: In(dto.answers.map((a) => a.answerId)),
          is_active: true,
        },
        relations: ['question', 'question.answers'],
      });

      const answerMap = new Map<number, Answer>();
      answers.forEach((ans) => answerMap.set(ans.id, ans));

      let totalScore = 0;
      const userAnswersToSave: UserAnswer[] = [];
      const answeredQuestions = new Set<number>();

      // Duyệt từng câu trả lời hợp lệ và tính điểm
      for (const item of dto.answers) {
        const answer = answerMap.get(item.answerId);
        const isValid = answer && answer.question?.id === item.questionId;

        if (!isValid || answeredQuestions.has(item.questionId)) continue;

        const isCorrect = answer.is_correct;
        const points = isCorrect ? (answer.question.points ?? 0) : 0;

        userAnswersToSave.push(
          this.userAnswerRepo.create({
            session_id: session.id,
            question_id: item.questionId,
            answer_id: item.answerId,
            is_correct: isCorrect,
            points_earned: points,
            question_text_snapshot: answer.question.question_text,
            answer_text_snapshot: answer.answer_text,
            answer_is_correct_snapshot: answer.is_correct,
            question_answers_snapshot: answer.question.answers
              .filter((a) => a.is_active)
              .map((a) => ({
                id: a.id,
                original_id: a.id,
                answer_text: a.answer_text,
                is_correct: a.is_correct,
                explanation: a.explanation,
              })),
          }),
        );

        if (isCorrect) totalScore += points;
        answeredQuestions.add(item.questionId);
      }

      // Tạo UserAnswer cho các câu không trả lời
      for (const qid of allQuestionIds) {
        if (answeredQuestions.has(qid)) continue;

        const question = allQuestions.find((q) => q.id === qid);
        userAnswersToSave.push(
          this.userAnswerRepo.create({
            session_id: session.id,
            question_id: qid,
            answer_id: null,
            is_correct: false,
            points_earned: 0,
            question_text_snapshot: question?.question_text ?? '',
            question_answers_snapshot: question?.answers
              ?.filter((a) => a.is_active)
              .map((a) => ({
                id: a.id,
                original_id: a.id,
                answer_text: a.answer_text,
                is_correct: a.is_correct,
                explanation: a.explanation,
              })),
          }),
        );
      }

      // Lưu tất cả UserAnswer và cập nhật trạng thái phiên làm bài
      await this.userAnswerRepo.save(userAnswersToSave);

      session.score = totalScore;
      session.is_completed = true;
      session.status = TestSessionStatus.SUBMITTED;
      session.submitted_at = new Date();
      session.time_spent = Math.floor(
        (Date.now() - session.started_at.getTime()) / 1000,
      );
      session.auto_graded = true;

      const updated = await this.testSessionRepo.save(session);

      return plainToInstance(TestSessionSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.submit_failed'));
    }
  }

  /**
   * Lấy danh sách lịch sử làm bài của người dùng.
   */
  async getSessionHistory(user: {
    id: number;
  }): Promise<TestSessionSerializer[]> {
    try {
      const sessions = await this.testSessionRepo.find({
        where: { user_id: user.id },
        relations: ['test', 'user_answers', 'user_answers.question'],
        order: { submitted_at: 'DESC' },
      });

      return plainToInstance(TestSessionSerializer, sessions, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.fetch_failed'));
    }
  }

  /**
   * Lấy chi tiết phiên làm bài kèm snapshot đúng lúc làm bài.
   */
  async getSessionByIdRaw(
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
      ],
    });

    if (!session) {
      throw new NotFoundException(
        await this.t('test_session.not_found_or_unauthorized'),
      );
    }

    if (session.user_answers) {
      session.user_answers = session.user_answers.filter(
        (ua) =>
          ua.question?.is_active &&
          (ua.answer === null || ua.answer?.is_active),
      );

      for (const ua of session.user_answers) {
        const snapshot = ua.question_answers_snapshot;

        if (snapshot) {
          // Gán lại đáp án từ snapshot
          ua.question.answers = snapshot;

          // Gán lại đáp án đã chọn từ snapshot
          const match = snapshot.find(
            (ans) =>
              ans.original_id === ua.answer_id || ans.id === ua.answer_id,
          );
          ua.answer = match ?? null;
        } else {
          // Nếu không có snapshot, fallback về các đáp án còn active
          ua.question.answers = ua.question.answers?.filter((a) => a.is_active);
        }
      }
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy chi tiết phiên làm bài cho màn hình kết quả (không dùng snapshot).
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

    if (session.user_answers) {
      session.user_answers = session.user_answers.filter(
        (ua) =>
          ua.question?.is_active &&
          (ua.answer === null || ua.answer?.is_active),
      );

      for (const ua of session.user_answers) {
        if (ua.question?.answers) {
          ua.question.answers = ua.question.answers.filter(
            (ans) => ans.is_active,
          );
        }
      }
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy tất cả phiên làm bài của tất cả học viên.
   */
  async getAllSessionsForAdmin(): Promise<TestSessionSerializer[]> {
    try {
      const sessions = await this.testSessionRepo.find({
        relations: ['test', 'user', 'user_answers'],
        order: { submitted_at: 'DESC' },
      });

      return plainToInstance(TestSessionSerializer, sessions, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        await this.t('test_session.fetch_failed_for_admin'),
      );
    }
  }
  /**
   * Xem chi tiết một phiên làm bài bất kỳ (dùng snapshot).
   */
  async getSessionDetailByAdmin(id: number): Promise<TestSessionSerializer> {
    const session = await this.testSessionRepo.findOne({
      where: { id },
      relations: [
        'test',
        'user',
        'user_answers',
        'user_answers.question',
        'user_answers.answer',
      ],
    });

    if (!session) {
      throw new NotFoundException(await this.t('test_session.not_found'));
    }

    if (session.user_answers) {
      session.user_answers = session.user_answers.filter(
        (ua) =>
          ua.question?.is_active &&
          (ua.answer === null || ua.answer?.is_active),
      );

      for (const ua of session.user_answers) {
        const snapshot = ua.question_answers_snapshot;

        if (snapshot) {
          ua.question.answers = snapshot;

          const match = snapshot.find(
            (ans) =>
              ans.original_id === ua.answer_id || ans.id === ua.answer_id,
          );
          ua.answer = match ?? null;
        } else {
          ua.question.answers = ua.question.answers?.filter((a) => a.is_active);
        }
      }
    }

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }
}
