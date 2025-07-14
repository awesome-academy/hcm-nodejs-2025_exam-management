import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestQuestion } from './entities/test_question.entity';
import { plainToInstance } from 'class-transformer';
import { TestQuestionSerializer } from './serializers/test_question.serializer';
import { CreateBulkTestQuestionDto } from './dto/create-bulk-test-question.dto';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { BaseService } from '../shared/base.service';
@Injectable()
export class TestQuestionService extends BaseService {
  constructor(
    @InjectRepository(TestQuestion)
    private readonly testQuestionRepo: Repository<TestQuestion>,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async findForDoingTest(test_id: number): Promise<TestQuestionSerializer[]> {
    try {
      const list = await this.testQuestionRepo.find({
        where: { test_id },
        relations: ['question', 'question.answers', 'test'],
        order: { order_number: 'ASC' },
      });

      const filtered = list
        .filter((tq) => tq.question?.is_active)
        .map((tq) => {
          if (tq.question?.answers) {
            tq.question.answers = tq.question.answers.filter(
              (ans) => ans.is_active,
            );
          }
          return tq;
        });

      return plainToInstance(TestQuestionSerializer, filtered, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_question.fetch_failed'));
    }
  }

  async findByTestId(test_id: number): Promise<TestQuestionSerializer[]> {
    try {
      const list = await this.testQuestionRepo.find({
        where: { test_id },
        relations: ['question', 'question.answers', 'test'],
        order: { order_number: 'ASC' },
      });

      return plainToInstance(TestQuestionSerializer, list, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test_question.fetch_failed'));
    }
  }

  async createBulk(
    testId: number,
    body: CreateBulkTestQuestionDto,
  ): Promise<TestQuestionSerializer[]> {
    try {
      const incomingQuestions = body.questions;

      const duplicateOrderNumbers = incomingQuestions
        .map((q) => q.order_number)
        .filter((num, i, arr) => arr.indexOf(num) !== i);

      if (duplicateOrderNumbers.length > 0) {
        throw new BadRequestException(
          await this.t('test_question.duplicate_order_in_request'),
        );
      }

      const existing = await this.testQuestionRepo.find({
        where: { test_id: testId },
      });

      const existingQuestionIds = existing.map((q) => q.question_id);
      const existingOrderNumbers = existing.map((q) => q.order_number);

      const duplicateQuestions = incomingQuestions.filter((q) =>
        existingQuestionIds.includes(q.question_id),
      );
      if (duplicateQuestions.length > 0) {
        throw new BadRequestException(
          await this.t('test_question.question_already_in_test'),
        );
      }

      const duplicateOrdersInDb = incomingQuestions.filter((q) =>
        existingOrderNumbers.includes(q.order_number),
      );
      if (duplicateOrdersInDb.length > 0) {
        throw new BadRequestException(
          await this.t('test_question.duplicate_order_in_db'),
        );
      }

      const data = incomingQuestions.map((q) => ({
        test_id: testId,
        question_id: q.question_id,
        order_number: q.order_number,
      }));

      const created = this.testQuestionRepo.create(data);
      const saved = await this.testQuestionRepo.save(created);

      return plainToInstance(TestQuestionSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        await this.t('test_question.create_failed'),
      );
    }
  }

  async delete(testId: number, questionId: number): Promise<string> {
    try {
      const found = await this.testQuestionRepo.findOneBy({
        test_id: testId,
        question_id: questionId,
      });
      if (!found) {
        throw new BadRequestException(await this.t('test_question.not_found'));
      }

      await this.testQuestionRepo.delete({
        test_id: testId,
        question_id: questionId,
      });

      return await this.t('test_question.deleted_success');
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        await this.t('test_question.delete_failed'),
      );
    }
  }
}
