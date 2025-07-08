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

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject) private subjectRepo: Repository<Subject>,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
    private cloudinaryService: CloudinaryService,
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
      if (error instanceof BadRequestException) throw error;
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
    file?: Express.Multer.File,
  ): Promise<SubjectSerializer> {
    try {
      const existed = await this.subjectRepo.findOneBy({ code: dto.code });
      if (existed) {
        const msg = await this.i18n.translate('subject.code_existed', {
          lang: this.lang,
        });
        throw new BadRequestException(msg);
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
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      throw new BadRequestException(
        await this.i18n.translate('subject.create_failed', { lang: this.lang }),
      );
    }
  }

  async update(
    id: number,
    dto: UpdateSubjectDto,
    file?: Express.Multer.File,
  ): Promise<SubjectSerializer> {
    try {
      const notFoundMsg = await this.i18n.translate(
        'subject.subject_not_found_by_id',
        { lang: this.lang },
      );
      const subject = await findOneByField(
        this.subjectRepo,
        'id',
        id,
        notFoundMsg,
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
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

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
        const msg = await this.i18n.translate(
          'subject.subject_not_found_by_id',
          {
            lang: this.lang,
          },
        );
        throw new BadRequestException(msg);
      }

      if (
        (subject.questions?.length ?? 0) > 0 ||
        (subject.tests?.length ?? 0) > 0
      ) {
        const msg = await this.i18n.translate(
          'subject.cannot_delete_subject_with_dependencies',
          { lang: this.lang },
        );
        throw new BadRequestException(msg);
      }

      await this.subjectRepo.softDelete(subject.id);

      const msg = await this.i18n.translate('subject.deleted_success', {
        lang: this.lang,
      });

      return { message: msg };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      throw new BadRequestException(
        await this.i18n.translate('subject.delete_failed', { lang: this.lang }),
      );
    }
  }
}
