import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionSerializer } from './serializers/question.serializer';
import { Answer } from '../answers/entities/answer.entity';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { RequestContextService } from '../shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { TEST_DEFAULT_VERSION } from '@/common/constants/test.constant';
import { validateMultipleChoiceAnswers } from '../shared/validators/answer.validator';
import { FindQuestionDto } from './dto/find-question.dto';
import {
  buildAndExecuteQuery,
  QueryMapping,
} from 'src/common/utils/query-builder';

@Injectable()
export class QuestionService extends BaseService {
  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(TestSessionQuestion)
    private testSessionQuestionRepo: Repository<TestSessionQuestion>,
    @InjectDataSource() private dataSource: DataSource,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  /**
   * Kiểm tra câu hỏi có đang được dùng trong bài thi chưa hoàn tất.
   */
  private async hasActiveTestSession(question: Question): Promise<boolean> {
    const sessionQuestions = await this.testSessionQuestionRepo.find({
      where: { question_id: question.id },
      relations: ['session'],
    });

    return sessionQuestions.some(
      (sq) =>
        sq.session?.status === TestSessionStatus.IN_PROGRESS &&
        sq.session?.is_completed === false,
    );
  }

  /**
   * Ngăn sửa/xoá nếu câu hỏi đang được dùng trong session thi đang diễn ra.
   */
  private async checkBeforeUpdateOrDelete(question: Question): Promise<void> {
    if (await this.hasActiveTestSession(question)) {
      throw new BadRequestException(
        await this.t('question.update_denied_has_test_sessions'),
      );
    }
  }

  /**
   * Lấy danh sách tất cả câu hỏi.
   */
  async findAll(query?: FindQuestionDto): Promise<QuestionSerializer[]> {
    const mappings: QueryMapping = {
      subject_id: 'equal',
      question_type: 'equal',
      creator_id: 'equal',
      question_text: 'like',
    };

    const questions = await buildAndExecuteQuery(
      this.questionRepo,
      query || {},
      mappings,
      {
        relations: ['creator', 'subject', 'answers'],
        order: { subject_id: 'ASC', id: 'ASC' },
      },
    );

    return plainToInstance(QuestionSerializer, questions, {
      excludeExtraneousValues: true,
    });
  }
  /**
   * Lấy chi tiết 1 câu hỏi theo id.
   */
  async findOneById(id: number): Promise<QuestionSerializer> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['creator', 'subject', 'answers'],
    });

    if (!question) {
      throw new BadRequestException(await this.t('question.not_found'));
    }

    return plainToInstance(QuestionSerializer, question, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Tạo mới câu hỏi cùng các đáp án.
   */
  async create(
    dto: CreateQuestionDto,
    user: { id: number },
  ): Promise<QuestionSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { answers = [], ...questionDto } = dto;

      // Validate trước khi tạo câu hỏi
      if (answers.length > 0) {
        await validateMultipleChoiceAnswers(this.i18n, answers);
      }

      const question = queryRunner.manager.create(Question, {
        ...questionDto,
        creator_id: user.id,
        version: TEST_DEFAULT_VERSION,
      });

      await queryRunner.manager.save(Question, question);

      if (answers.length > 0) {
        const answerEntities = answers.map((a) =>
          queryRunner.manager.create(Answer, {
            ...a,
            question_id: question.id,
          }),
        );
        await queryRunner.manager.save(Answer, answerEntities);
      }

      await queryRunner.commitTransaction();

      const result = await this.questionRepo.findOne({
        where: { id: question.id },
        relations: ['creator', 'subject', 'answers'],
      });

      return plainToInstance(QuestionSerializer, result, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('question.create_failed'));
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Cập nhật câu hỏi, clone nếu đã có user answer.
   */
  async update(
    id: number,
    dto: UpdateQuestionDto,
  ): Promise<QuestionSerializer> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const question = await manager.findOne(Question, {
          where: { id },
          relations: ['user_answers'],
        });

        if (!question) {
          throw new BadRequestException(await this.t('question.not_found'));
        }

        await this.checkBeforeUpdateOrDelete(question);

        const dtoAnswers = dto.answers || [];

        const safeFields = ['is_active', 'answers'];
        const hasUserAnswers = question.user_answers?.length > 0;

        const hasUnsafeChanges = Object.entries(dto).some(([key, value]) => {
          if (safeFields.includes(key)) return false;
          return (question as any)[key] !== value;
        });

        if (hasUserAnswers && hasUnsafeChanges) {
          const {
            answers: _ignoredAnswers,
            is_active: _ignoredActive,
            ...questionData
          } = dto;

          const newQuestion = manager.create(Question, {
            ...questionData,
            is_active: true, // ép luôn nếu clone
            creator_id: question.creator_id,
            subject_id: question.subject_id,
            version: question.version + 1,
          });
          await manager.save(newQuestion);

          // Chỉ tạo các Answer có is_active = true từ DTO
          const newAnswers = dtoAnswers
            .filter((a) => a.is_active)
            .map((a) =>
              manager.create(Answer, {
                answer_text: a.answer_text,
                is_correct: a.is_correct,
                explanation: a.explanation,
                is_active: true,
                question_id: newQuestion.id,
              }),
            );

          if (newAnswers.length) {
            await manager.save(newAnswers);
          }

          // Vô hiệu hoá question cũ
          question.is_active = false;
          await manager.save(question);

          return plainToInstance(QuestionSerializer, newQuestion, {
            excludeExtraneousValues: true,
          });
        }

        // Nếu chưa có user_answer thì chỉ cần cập nhật
        const updated = manager.merge(Question, question, dto);
        await manager.save(updated);

        return plainToInstance(QuestionSerializer, updated, {
          excludeExtraneousValues: true,
        });
      });
    } catch (err) {
      console.error(err);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('question.update_failed'));
    }
  }

  /**
   * Xoá mềm câu hỏi nếu không bị ràng buộc dữ liệu khác.
   */
  async softDelete(id: number): Promise<{ message: string }> {
    try {
      const question = await this.questionRepo.findOne({
        where: { id },
        relations: ['answers', 'user_answers'],
      });

      if (!question) {
        throw new BadRequestException(await this.t('question.not_found'));
      }

      if (question.answers.length > 0) {
        throw new BadRequestException(
          await this.t('question.delete_denied_has_answers'),
        );
      }

      if (question.user_answers.length > 0) {
        throw new BadRequestException(
          await this.t('question.delete_denied_has_user_answers'),
        );
      }

      const usedInSession = await this.testSessionQuestionRepo.findOne({
        where: { question_id: id },
      });

      if (usedInSession) {
        throw new BadRequestException(
          await this.t('question.delete_denied_has_test_questions'),
        );
      }

      await this.checkBeforeUpdateOrDelete(question);
      await this.questionRepo.softDelete(id);

      return { message: await this.t('question.deleted_success') };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('question.delete_failed'));
    }
  }

  /**
   * Thống kê số câu hỏi theo độ khó trong 1 môn học.
   */
  async getStatsBySubject(subjectId: number): Promise<{
    easy: number;
    medium: number;
    hard: number;
  }> {
    try {
      const levels = ['easy', 'medium', 'hard'] as const;

      const stats = await Promise.all(
        levels.map((level) =>
          this.questionRepo.count({
            where: {
              subject_id: subjectId,
              difficulty_level: level,
              is_active: true,
            },
          }),
        ),
      );

      return {
        easy: stats[0],
        medium: stats[1],
        hard: stats[2],
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('question.get_stats_failed'));
    }
  }
}
