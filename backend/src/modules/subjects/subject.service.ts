import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '../shared/request-context.service';
import { SubjectSerializer } from './serializers/subject.serializer';
import { plainToInstance } from 'class-transformer';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { findOneByField } from '@/common/utils/repository.util';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private get lang() {
    return this.context.getLang() || 'vi';
  }

  async findAll(): Promise<SubjectSerializer[]> {
    try {
      const subjects = await this.subjectRepo.find({
        order: { name: 'ASC' },
        withDeleted: false,
      });

      return plainToInstance(SubjectSerializer, subjects, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('[Subject FindAll Error]', error);
      throw new BadRequestException(
        await this.i18n.translate('subject.fetch_failed', { lang: this.lang }),
      );
    }
  }

  async findOneById(id: number): Promise<SubjectSerializer> {
    const subject = await findOneByField(
      this.subjectRepo,
      'id',
      id,
      await this.i18n.translate('subject.subject_not_found_by_id', {
        lang: this.lang,
      }),
    );

    return plainToInstance(SubjectSerializer, subject, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateSubjectDto,
    user: { id: number },
  ): Promise<SubjectSerializer> {
    try {
      const existed = await this.subjectRepo.findOneBy({ code: dto.code });
      if (existed) {
        throw new BadRequestException(
          await this.i18n.translate('subject.code_existed', {
            lang: this.lang,
          }),
        );
      }

      const subject = this.subjectRepo.create({
        ...dto,
        creator_id: user.id,
      });
      await this.subjectRepo.save(subject);

      return plainToInstance(SubjectSerializer, subject, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (['ER_DUP_ENTRY', '23505'].includes(error.code)) {
        throw new BadRequestException(
          await this.i18n.translate('subject.duplicate_code', {
            lang: this.lang,
          }),
        );
      }

      console.error('[Subject Create Error]', error);
      throw new BadRequestException(
        await this.i18n.translate('subject.create_failed', { lang: this.lang }),
      );
    }
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<SubjectSerializer> {
    try {
      const subject = await findOneByField(
        this.subjectRepo,
        'id',
        id,
        await this.i18n.translate('subject.subject_not_found_by_id', {
          lang: this.lang,
        }),
      );

      const updated = this.subjectRepo.merge(subject, dto);
      await this.subjectRepo.save(updated);

      return plainToInstance(SubjectSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('[Subject Update Error]', error);
      throw new BadRequestException(
        await this.i18n.translate('subject.update_failed', { lang: this.lang }),
      );
    }
  }

  async softDelete(id: number): Promise<{ message: string }> {
    try {
      const subject = await this.subjectRepo.findOne({
        where: { id },
        relations: ['questions', 'tests'],
      });

      if (!subject) {
        throw new BadRequestException(
          await this.i18n.translate('subject.subject_not_found_by_id', {
            lang: this.lang,
          }),
        );
      }

      if (
        (subject.questions?.length ?? 0) > 0 ||
        (subject.tests?.length ?? 0) > 0
      ) {
        throw new BadRequestException(
          await this.i18n.translate(
            'subject.cannot_delete_subject_with_dependencies',
            {
              lang: this.lang,
            },
          ),
        );
      }

      await this.subjectRepo.softDelete(subject.id);

      return {
        message: await this.i18n.translate('subject.deleted_success', {
          lang: this.lang,
        }),
      };
    } catch (error) {
      console.error('[Subject Delete Error]', error);
      throw new BadRequestException(
        await this.i18n.translate('subject.delete_failed', { lang: this.lang }),
      );
    }
  }
}
