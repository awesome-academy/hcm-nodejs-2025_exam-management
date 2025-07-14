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
import { CloudinaryService } from '../shared/cloudinary.service';
import { BaseService } from '../shared/base.service';

@Injectable()
export class SubjectService extends BaseService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    i18n: I18nService,
    context: RequestContextService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    super(i18n, context);
  }

  async findAll(): Promise<SubjectSerializer[]> {
    try {
      const subjects = await this.subjectRepo.find({
        order: { id: 'ASC' },
        withDeleted: false,
      });

      return plainToInstance(SubjectSerializer, subjects, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new BadRequestException(await this.t('subject.fetch_failed'));
    }
  }

  async findOneById(id: number): Promise<SubjectSerializer> {
    const subject = await this.subjectRepo.findOne({
      where: { id },
      relations: ['tests'],
    });

    if (!subject) {
      throw new BadRequestException(
        await this.t('subject.subject_not_found_by_id'),
      );
    }

    subject.tests = subject.tests?.filter((test) => test.is_published);

    return plainToInstance(SubjectSerializer, subject, {
      excludeExtraneousValues: true,
    });
  }

  async create(
    dto: CreateSubjectDto,
    user: { id: number },
    file?: Express.Multer.File,
  ): Promise<SubjectSerializer> {
    try {
      const existed = await this.subjectRepo.findOneBy({ code: dto.code });
      if (existed) {
        throw new BadRequestException(await this.t('subject.code_existed'));
      }

      let imageUrl = dto.image_url || undefined;
      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file);
      }

      const subject = this.subjectRepo.create({
        ...dto,
        image_url: imageUrl,
        creator_id: user.id,
      });

      await this.subjectRepo.save(subject);

      return plainToInstance(SubjectSerializer, subject, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('subject.create_failed'));
    }
  }

  async update(
    id: number,
    dto: UpdateSubjectDto,
    file?: Express.Multer.File,
  ): Promise<SubjectSerializer> {
    try {
      const subject = await findOneByField(
        this.subjectRepo,
        'id',
        id,
        await this.t('subject.subject_not_found_by_id'),
      );

      let imageUrl = dto.image_url || subject.image_url;
      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file);
      }

      const updated = this.subjectRepo.merge(subject, {
        ...dto,
        image_url: imageUrl,
      });

      await this.subjectRepo.save(updated);

      return plainToInstance(SubjectSerializer, updated, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('subject.update_failed'));
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
          await this.t('subject.subject_not_found_by_id'),
        );
      }

      if (
        (subject.questions?.length ?? 0) > 0 ||
        (subject.tests?.length ?? 0) > 0
      ) {
        throw new BadRequestException(
          await this.t('subject.cannot_delete_subject_with_dependencies'),
        );
      }

      await this.subjectRepo.softDelete(subject.id);

      return { message: await this.t('subject.deleted_success') };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('subject.delete_failed'));
    }
  }
}
