import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { plainToInstance } from 'class-transformer';
import { AnswerSerializer } from './serializers/answer.serializer';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { CreateAnswerWithoutQuestionIdDto } from './dto/create-without-questionId.dto';
import { TestSessionStatus } from '@/common/enums/testSession.enum';
import { BaseService } from '@/modules/shared/base.service';

@Injectable()
export class AnswerService extends BaseService {
  constructor(
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
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

  async update(id: number, dto: UpdateAnswerDto): Promise<AnswerSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const answer = await queryRunner.manager.findOne(Answer, {
        where: { id },
        relations: [
          'user_answers',
          'question',
          'question.test_questions',
          'question.test_questions.test.test_sessions',
        ],
      });

      if (!answer) {
        throw new BadRequestException(await this.t('answer.not_found'));
      }

      const hasActiveSession = answer.question?.test_questions?.some((tq) =>
        tq.test?.test_sessions?.some(
          (session) =>
            session.status === TestSessionStatus.IN_PROGRESS &&
            session.is_completed === false,
        ),
      );

      if (hasActiveSession) {
        throw new BadRequestException(
          await this.t('answer.update_denied_has_test_sessions'),
        );
      }

      let resultAnswer: Answer;

      if (answer.user_answers?.length > 0) {
        const newAnswer = queryRunner.manager.create(Answer, {
          ...dto,
          question_id: answer.question_id,
        });

        const saved = await queryRunner.manager.save(Answer, newAnswer);

        answer.is_active = false;
        await queryRunner.manager.save(Answer, answer);

        resultAnswer = saved;
      } else {
        const merged = queryRunner.manager.merge(Answer, answer, dto);
        resultAnswer = await queryRunner.manager.save(Answer, merged);
      }

      await queryRunner.commitTransaction();

      return plainToInstance(AnswerSerializer, resultAnswer, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('answer.update_failed'));
    } finally {
      await queryRunner.release();
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
