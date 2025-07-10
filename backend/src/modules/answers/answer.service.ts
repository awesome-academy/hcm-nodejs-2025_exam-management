import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { plainToInstance } from 'class-transformer';
import { AnswerSerializer } from './serializers/answer.serializer';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { findOneByField } from '@/common/utils/repository.util';
import { CreateAnswerWithoutQuestionIdDto } from './dto/create-without-questionId.dto';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private get lang() {
    return this.context.getLang() || 'vi';
  }

  private async t(key: string): Promise<string> {
    return (await this.i18n.translate(key, { lang: this.lang })) as string;
  }

  async findByQuestion(question_id: number): Promise<AnswerSerializer[]> {
    try {
      const answers = await this.answerRepo.find({
        where: { question_id },
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

  async update(id: number, dto: UpdateAnswerDto): Promise<AnswerSerializer> {
    try {
      const answer = await findOneByField(
        this.answerRepo,
        'id',
        id,
        await this.t('answer.not_found'),
      );

      const updated = this.answerRepo.merge(answer, dto);
      await this.answerRepo.save(updated);

      return plainToInstance(AnswerSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.update_failed'));
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

  async createMany(
    questionId: number,
    dtos: CreateAnswerWithoutQuestionIdDto[],
  ): Promise<AnswerSerializer[]> {
    try {
      const createdAnswers = this.answerRepo.create(
        dtos.map((dto) => ({
          ...dto,
          question_id: questionId,
        })),
      );
      const saved = await this.answerRepo.save(createdAnswers);
      return plainToInstance(AnswerSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.create_failed'));
    }
  }

  async deleteByQuestionId(questionId: number): Promise<{ message: string }> {
    try {
      const answers = await this.answerRepo.find({
        where: { question_id: questionId },
        relations: ['user_answers'],
      });

      const hasUsedAnswers = answers.some(
        (ans) => ans.user_answers?.length > 0,
      );

      if (hasUsedAnswers) {
        throw new BadRequestException(
          await this.t('answer.delete_denied_has_user_answers'),
        );
      }

      await this.answerRepo.softDelete({ question_id: questionId });

      return { message: await this.t('answer.deleted_success') };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.delete_failed'));
    }
  }
}
