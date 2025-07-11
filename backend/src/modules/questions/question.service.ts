import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Question } from './entities/question.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { plainToInstance } from 'class-transformer';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionSerializer } from './serializers/question.serializer';
import { TestQuestion } from '../test_questions/entities/test_question.entity';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { BaseService } from '@/modules/shared/base.service';

@Injectable()
export class QuestionService extends BaseService {
  constructor(
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectRepository(TestQuestion)
    private testQuestionRepo: Repository<TestQuestion>,
    @InjectDataSource() private dataSource: DataSource,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async findAll(): Promise<QuestionSerializer[]> {
    try {
      const questions = await this.questionRepo.find({
        order: {
          subject_id: 'ASC',
          id: 'ASC',
        },
        relations: ['creator', 'subject', 'answers'],
        withDeleted: false,
      });

      return plainToInstance(QuestionSerializer, questions, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('question.fetch_failed'));
    }
  }

  async findOneById(id: number): Promise<QuestionSerializer> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['creator', 'subject', 'answers'],
    });

    if (!question)
      throw new BadRequestException(await this.t('question.not_found'));

    return plainToInstance(QuestionSerializer, question, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateQuestionDto,
    user: { id: number },
  ): Promise<QuestionSerializer> {
    try {
      const question = this.questionRepo.create({
        ...dto,
        creator_id: user.id,
      });

      await this.questionRepo.save(question);

      return plainToInstance(QuestionSerializer, question, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('question.create_failed'));
    }
  }

  async update(
    id: number,
    dto: UpdateQuestionDto,
  ): Promise<QuestionSerializer> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const question = await manager.findOne(Question, {
          where: { id },
          relations: [
            'user_answers',
            'test_questions',
            'test_questions.test',
            'test_questions.test.test_sessions',
          ],
        });

        if (!question) {
          throw new BadRequestException(await this.t('question.not_found'));
        }

        const hasActiveSession = question.test_questions?.some((tq) =>
          tq.test?.test_sessions?.some(
            (session) =>
              session.status === TestSessionStatus.IN_PROGRESS &&
              session.is_completed === false,
          ),
        );

        if (hasActiveSession) {
          throw new BadRequestException(
            await this.t('question.update_denied_has_test_sessions'),
          );
        }

        if (question.user_answers?.length > 0) {
          const newQuestion = manager.create(Question, {
            ...dto,
            creator_id: question.creator_id,
            subject_id: question.subject_id,
          });

          await manager.save(newQuestion);

          question.is_active = false;
          await manager.save(question);

          return plainToInstance(QuestionSerializer, newQuestion, {
            excludeExtraneousValues: true,
          });
        }

        const updated = manager.merge(Question, question, dto);
        await manager.save(updated);

        return plainToInstance(QuestionSerializer, updated, {
          excludeExtraneousValues: true,
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('question.update_failed'));
    }
  }

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

      const usedInTest = await this.testQuestionRepo.findOne({
        where: { question_id: id },
      });

      if (usedInTest) {
        throw new BadRequestException(
          await this.t('question.delete_denied_has_test_questions'),
        );
      }

      await this.questionRepo.softDelete(id);

      return { message: await this.t('question.deleted_success') };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('question.delete_failed'));
    }
  }
}
