import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './entities/test.entity';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { plainToInstance } from 'class-transformer';
import { TestSerializer } from './serializers/test.serializer';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { BaseService } from '../shared/base.service';

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
        if (!isNaN(parsedId)) {
          where.subject_id = parsedId;
        }
      }

      if (filter?.is_published !== undefined) {
        if (filter.is_published === 'true') {
          where.is_published = true;
        } else if (filter.is_published === 'false') {
          where.is_published = false;
        }
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
      const test = this.testRepo.create({ ...dto, creator_id: user.id });
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
    try {
      const test = await this.testRepo.findOneBy({ id });
      if (!test) throw new BadRequestException(await this.t('test.not_found'));

      const updated = this.testRepo.merge(test, dto);
      await this.testRepo.save(updated);

      return plainToInstance(TestSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(await this.t('test.update_failed'));
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
