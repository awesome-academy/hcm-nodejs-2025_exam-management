import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { plainToInstance } from 'class-transformer';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionSerializer } from './serializers/question.serializer';
import { findOneByField } from '@/common/utils/repository.util';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question) private questionRepo: Repository<Question>,
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
        relations: ['creator', 'subject'],
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
      relations: ['creator', 'subject'],
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
      const question = await findOneByField(
        this.questionRepo,
        'id',
        id,
        await this.t('question.not_found'),
      );

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
        relations: ['answers'],
      });

      if (!question)
        throw new BadRequestException(await this.t('question.not_found'));

      if (question.answers && question.answers.length > 0) {
        throw new BadRequestException(
          await this.t('question.delete_denied_has_answers'),
        );
      }

      await this.questionRepo.softDelete(id);

      const message = await this.t('question.deleted_success');
      return { message };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('question.delete_failed'));
    }
  }
}
