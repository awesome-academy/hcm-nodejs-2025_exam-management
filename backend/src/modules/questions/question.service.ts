import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { plainToInstance } from 'class-transformer';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionSerializer } from './serializers/question.serializer';
import { DataSource } from 'typeorm';
import { TestQuestion } from '../test_questions/entities/test_question.entity';
import { TestSessionStatus } from '@/common/enums/testSession.enum';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question) private questionRepo: Repository<Question>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private get lang() {
    return this.context.getLang() || 'vi';
  }

  private async t(key: string): Promise<string> {
    return (await this.i18n.translate(key, { lang: this.lang })) as string;
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
      const question = await this.questionRepo.findOne({
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

      // Nếu có test session đang làm → không được sửa
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

      // Nếu đã có người làm → clone câu mới, disable câu cũ
      if (question.user_answers?.length > 0) {
        const newQuestion = this.questionRepo.create({
          ...dto,
          creator_id: question.creator_id,
          subject_id: question.subject_id,
        });

        await this.questionRepo.save(newQuestion);

        question.is_active = false;
        await this.questionRepo.save(question);

        return plainToInstance(QuestionSerializer, newQuestion, {
          excludeExtraneousValues: true,
        });
      }

      // Nếu không bị ràng buộc gì → cập nhật trực tiếp
      const updated = this.questionRepo.merge(question, dto);
      await this.questionRepo.save(updated);

      return plainToInstance(QuestionSerializer, updated, {
        excludeExtraneousValues: true,
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

      const usedInTest = await this.dataSource
        .getRepository(TestQuestion)
        .findOne({ where: { question_id: id } });

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
