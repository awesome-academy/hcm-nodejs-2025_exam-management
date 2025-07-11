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
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { TestQuestion } from '../test_questions/entities/test_question.entity';
@Injectable()
export class TestSessionService {
  constructor(
    @InjectRepository(TestSession)
    private testSessionRepo: Repository<TestSession>,

    @InjectRepository(UserAnswer)
    private userAnswerRepo: Repository<UserAnswer>,

    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,

    @InjectDataSource()
    private dataSource: DataSource,

    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private get lang() {
    return this.context.getLang() || 'vi';
  }

  private async t(key: string): Promise<string> {
    return this.i18n.translate(key, { lang: this.lang }) as Promise<string>;
  }

  /**
   * Tạo một phiên làm bài mới cho người dùng.
   * - Kiểm tra xem đã có session đang làm chưa, nếu có thì trả lại.
   * - Nếu chưa có thì tạo mới session.
   */
  async createSession(
    dto: CreateTestSessionDto,
    user: { id: number },
  ): Promise<TestSessionSerializer> {
    try {
      const session = await this.dataSource.transaction(async (manager) => {
        const sessionRepo = manager.getRepository(TestSession);

        // Tìm session chưa hoàn thành của user cho test này
        const existingSession = await sessionRepo.findOne({
          where: {
            user_id: user.id,
            test_id: dto.testId,
            is_completed: false,
            status: TestSessionStatus.IN_PROGRESS,
          },
          lock: { mode: 'pessimistic_write' }, // tránh race condition
        });

        if (existingSession) return existingSession;

        // Tạo mới session nếu chưa có
        const newSession = sessionRepo.create({
          test_id: dto.testId,
          user_id: user.id,
          started_at: new Date(),
          status: TestSessionStatus.IN_PROGRESS,
          is_completed: false,
        });

        return await sessionRepo.save(newSession);
      });

      // Trả về session đã tạo (dạng đã serialize)
      return plainToInstance(TestSessionSerializer, session, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_session.create_failed'));
    }
  }

  /**
   * Nộp bài thi.
   * - Kiểm tra session tồn tại và thuộc user hiện tại.
   * - Tính điểm dựa trên câu trả lời đúng.
   * - Lưu lại toàn bộ đáp án (bao gồm cả câu không chọn).
   * - Cập nhật trạng thái session về "SUBMITTED".
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

      // Lấy danh sách câu hỏi thuộc bài test
      const testQuestions = await this.dataSource
        .getRepository(TestQuestion)
        .find({
          where: {
            test_id: session.test_id,
            question: { is_active: true },
          },
          relations: ['question'],
        });

      const allQuestions = testQuestions.map((tq) => tq.question);
      const allQuestionIds = allQuestions.map((q) => q.id);

      // Lấy các đáp án được chọn trong request
      const answers = await this.answerRepo.find({
        where: { id: In(dto.answers.map((a) => a.answerId)) },
        relations: ['question'],
      });

      const answerMap = new Map<number, Answer>();
      answers.forEach((ans) => answerMap.set(ans.id, ans));

      let totalScore = 0;
      const userAnswersToSave: UserAnswer[] = [];
      const answeredQuestions = new Set<number>();

      // Duyệt các câu trả lời đã chọn
      for (const item of dto.answers) {
        const answer = answerMap.get(item.answerId);

        const isValid = answer && answer.question?.id === item.questionId;
        if (!isValid || answeredQuestions.has(item.questionId)) continue;

        const isCorrect = answer.is_correct;
        const points = isCorrect ? (answer.question.points ?? 0) : 0;

        const userAnswer = this.userAnswerRepo.create({
          session_id: session.id,
          question_id: item.questionId,
          answer_id: item.answerId,
          is_correct: isCorrect,
          points_earned: points,
        });

        userAnswersToSave.push(userAnswer);
        if (isCorrect) totalScore += points;
        answeredQuestions.add(item.questionId);
      }

      // Lưu các câu chưa trả lời (mặc định sai)
      for (const qid of allQuestionIds) {
        if (answeredQuestions.has(qid)) continue;

        const userAnswer = this.userAnswerRepo.create({
          session_id: session.id,
          question_id: qid,
          answer_id: null,
          is_correct: false,
          points_earned: 0,
        });

        userAnswersToSave.push(userAnswer);
      }

      // Lưu tất cả đáp án
      await this.userAnswerRepo.save(userAnswersToSave);

      // Cập nhật lại thông tin session
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

  async getSessionHistory(user: {
    id: number;
  }): Promise<TestSessionSerializer[]> {
    try {
      const sessions = await this.testSessionRepo.find({
        where: { user_id: user.id },
        relations: ['test'],
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

    return plainToInstance(TestSessionSerializer, session, {
      excludeExtraneousValues: true,
    });
  }
}
