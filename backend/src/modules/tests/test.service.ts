import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

import { Test } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestSerializer } from './serializers/test.serializer';
import { RequestContextService } from '../shared/request-context.service';
import { BaseService } from '../shared/base.service';
import { TEST_DEFAULT_VERSION } from '@/common/constants/test.constant';
import { TestSessionStatus } from '@/common/enums/testSession.enum';

@Injectable()
export class TestService extends BaseService {
  constructor(
    @InjectRepository(Test) private testRepo: Repository<Test>,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async findAll(filter?: {
    subject_id?: string;
    is_published?: string;
  }): Promise<TestSerializer[]> {
    try {
      const where: any = {};

      if (filter?.subject_id) {
        const parsedId = Number(filter.subject_id);
        if (!isNaN(parsedId)) where.subject_id = parsedId;
      }

      if (filter?.is_published !== undefined) {
        where.is_published = filter.is_published === 'true';
      }

      const tests = await this.testRepo.find({
        where,
        relations: ['creator', 'subject', 'test_sessions'],
        order: { id: 'ASC' },
      });

      return plainToInstance(TestSerializer, tests, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.fetch_failed'));
    }
  }

  async findOneById(id: number): Promise<TestSerializer> {
    try {
      const test = await this.testRepo.findOne({
        where: { id },
        relations: ['creator', 'subject', 'test_sessions'],
      });

      if (!test) throw new BadRequestException(await this.t('test.not_found'));

      return plainToInstance(TestSerializer, test, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.fetch_failed'));
    }
  }

  async create(
    dto: CreateTestDto,
    user: { id: number },
  ): Promise<TestSerializer> {
    try {
      const totalCount =
        (dto.easy_question_count || 0) +
        (dto.medium_question_count || 0) +
        (dto.hard_question_count || 0);

      const test = this.testRepo.create({
        ...dto,
        creator_id: user.id,
        question_count: totalCount,
        version: TEST_DEFAULT_VERSION,
        is_latest: true,
      });

      await this.testRepo.save(test);

      return plainToInstance(TestSerializer, test, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.create_failed'));
    }
  }

  async update(id: number, dto: UpdateTestDto): Promise<TestSerializer> {
    const queryRunner = this.testRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const test = await this.testRepo.findOne({
        where: { id },
        relations: ['test_sessions'],
      });

      if (!test) throw new BadRequestException(await this.t('test.not_found'));

      // Không cho phép cập nhật nếu có session đang làm bài (in_progress và chưa hoàn thành)
      const hasInProgressSession = test.test_sessions?.some(
        (s) => s.status === TestSessionStatus.IN_PROGRESS && !s.is_completed,
      );

      if (hasInProgressSession) {
        throw new BadRequestException(
          await this.t('test.update_denied_has_in_progress_session'),
        );
      }
      const hasSessions = test.test_sessions?.length > 0;
      // Các field "an toàn" có thể update trực tiếp nếu đã có session
      const safeFields = ['is_published', 'is_latest'];

      // Kiểm tra nếu có thay đổi field không an toàn
      const hasUnsafeChanges = Object.entries(dto).some(([key, value]) => {
        if (safeFields.includes(key)) return false;
        return (test as any)[key] !== value;
      });

      // Tính lại tổng câu hỏi nếu có thay đổi
      const totalCount =
        (dto.easy_question_count ?? test.easy_question_count ?? 0) +
        (dto.medium_question_count ?? test.medium_question_count ?? 0) +
        (dto.hard_question_count ?? test.hard_question_count ?? 0);

      // Nếu có session và thay đổi field không an toàn → clone bản mới
      if (hasSessions && hasUnsafeChanges) {
        test.is_latest = false;
        test.is_published = false;

        await queryRunner.manager.save(Test, test);

        const { test_sessions: _ignoreSessions, ...cleanedTest } = test;
        const cloned = this.testRepo.create({
          ...cleanedTest,
          ...dto,
          id: undefined,
          version: test.version + 1,
          is_latest: true,
          question_count: totalCount,
        });

        const saved = await queryRunner.manager.save(Test, cloned);
        await queryRunner.commitTransaction();

        return plainToInstance(TestSerializer, saved, {
          excludeExtraneousValues: true,
        });
      }

      // Nếu không có session hoặc chỉ cập nhật field an toàn → update trực tiếp
      const updated = this.testRepo.merge(test, {
        ...dto,
        question_count: totalCount,
      });

      const saved = await queryRunner.manager.save(Test, updated);
      await queryRunner.commitTransaction();

      return plainToInstance(TestSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.update_failed'));
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: number): Promise<{ message: string }> {
    try {
      const test = await this.testRepo.findOneBy({ id });
      if (!test) throw new BadRequestException(await this.t('test.not_found'));

      await this.testRepo.softDelete(id);

      return { message: await this.t('test.deleted_success') };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.delete_failed'));
    }
  }
}
