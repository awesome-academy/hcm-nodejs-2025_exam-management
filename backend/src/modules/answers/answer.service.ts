import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { Question } from '../questions/entities/question.entity';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { plainToInstance } from 'class-transformer';
import { AnswerSerializer } from './serializers/answer.serializer';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import {
  validateMultipleChoiceAnswers,
  validateEssayAnswers,
} from '../shared/validators/answer.validator';
import { QuestionType } from '@/common/enums/question.enum';
@Injectable()
export class AnswerService extends BaseService {
  constructor(
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(TestSessionQuestion)
    private testSessionQuestionRepo: Repository<TestSessionQuestion>,
    private readonly dataSource: DataSource,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async findByQuestion(question_id: number): Promise<AnswerSerializer[]> {
    try {
      const answers = await this.answerRepo.find({
        where: { question_id },
        relations: ['question', 'user_answers'],
        order: { id: 'ASC' },
      });

      return plainToInstance(AnswerSerializer, answers, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.fetch_failed'));
    }
  }
  async delete(id: number): Promise<{ message: string }> {
    try {
      const answer = await this.answerRepo.findOne({
        where: { id },
        relations: ['user_answers'],
      });

      if (!answer) {
        throw new BadRequestException(await this.t('answer.not_found'));
      }

      if (answer.user_answers?.length > 0) {
        throw new BadRequestException(
          await this.t('answer.delete_denied_has_user_answers'),
        );
      }

      await this.answerRepo.softDelete(id);

      return { message: await this.t('answer.deleted_success') };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.delete_failed'));
    }
  }
  async create(
    question_id: number,
    dto: CreateAnswerDto,
  ): Promise<AnswerSerializer> {
    try {
      // Lấy thông tin câu hỏi
      const question = await this.questionRepo.findOne({
        where: { id: question_id },
      });
      if (!question) {
        throw new BadRequestException(await this.t('question.not_found'));
      }

      // Lấy các đáp án hiện có
      const existingAnswers = await this.answerRepo.find({
        where: { question_id },
      });
      const allAnswers = [...existingAnswers, { ...dto }];

      // Validate theo loại câu hỏi
      if (question.question_type === QuestionType.MULTIPLE_CHOICE) {
        await validateMultipleChoiceAnswers(this.i18n, allAnswers);
      } else if (question.question_type === QuestionType.ESSAY) {
        await validateEssayAnswers(this.i18n, allAnswers);
      }

      const answer = this.answerRepo.create({
        ...dto,
        question_id,
      });

      const saved = await this.answerRepo.save(answer);

      return plainToInstance(AnswerSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.create_failed'));
    }
  }

  async update(id: number, dto: UpdateAnswerDto): Promise<AnswerSerializer> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const answer = await manager.findOne(Answer, { where: { id } });

        if (!answer) {
          throw new BadRequestException(await this.t('answer.not_found'));
        }

        const question = await manager.findOne(Question, {
          where: { id: answer.question_id },
        });

        if (!question) {
          throw new BadRequestException(await this.t('question.not_found'));
        }

        // Kiểm tra nếu có đang nằm trong bài thi đang làm dở
        const activeTestSession = await manager.findOne(TestSessionQuestion, {
          where: { question_id: question.id },
          relations: ['session'],
        });

        if (
          activeTestSession &&
          activeTestSession.session.status === TestSessionStatus.IN_PROGRESS &&
          !activeTestSession.session.is_completed
        ) {
          throw new BadRequestException(
            await this.t('answer.update_denied_active_test_session'),
          );
        }

        // Kiểm tra có nằm trong snapshot (đã sử dụng trong bài thi)
        const usedInTestWithSnapshot = await manager
          .createQueryBuilder(TestSessionQuestion, 'tsq')
          .where('tsq.question_id = :questionId', { questionId: question.id })
          .andWhere('JSON_CONTAINS(tsq.answers_snapshot, :answerIdJson)', {
            answerIdJson: JSON.stringify([{ id: answer.id }]),
          })
          .getOne();

        if (usedInTestWithSnapshot) {
          // Nếu chỉ thay đổi is_active thì không clone
          const isOnlyChangeIsActive =
            'is_active' in dto &&
            dto.is_active !== answer.is_active &&
            Object.entries(dto).every(
              ([key, value]) =>
                key === 'is_active' || value === (answer as any)[key],
            );

          if (isOnlyChangeIsActive) {
            const updated = manager.merge(Answer, answer, dto);
            const saved = await manager.save(updated);

            return plainToInstance(AnswerSerializer, saved, {
              excludeExtraneousValues: true,
            });
          }

          // Clone nếu thay đổi nội dung khác
          const newAnswer = manager.create(Answer, {
            ...answer,
            ...dto,
            id: undefined,
            is_active: true,
          });

          const saved = await manager.save(newAnswer);
          await manager.update(Answer, { id: answer.id }, { is_active: false });

          return plainToInstance(AnswerSerializer, saved, {
            excludeExtraneousValues: true,
          });
        }

        // Nếu chưa từng nằm trong snapshot → update bình thường (có validate)
        const otherAnswers = await manager.find(Answer, {
          where: {
            question_id: question.id,
            id: Not(id),
          },
        });

        const allAnswers = [...otherAnswers, { ...answer, ...dto }];
        if (question.question_type === QuestionType.MULTIPLE_CHOICE) {
          await validateMultipleChoiceAnswers(this.i18n, allAnswers);
        } else if (question.question_type === QuestionType.ESSAY) {
          await validateEssayAnswers(this.i18n, allAnswers);
        }

        const updated = manager.merge(Answer, answer, dto);
        const saved = await manager.save(updated);

        return plainToInstance(AnswerSerializer, saved, {
          excludeExtraneousValues: true,
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.update_failed'));
    }
  }
}
