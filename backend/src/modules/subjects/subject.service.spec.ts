import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CloudinaryService } from '../shared/cloudinary.service';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import {
  createMockRepository,
  mockI18nService,
  mockRequestContextService,
  mockCloudinaryService,
} from '@/test/utils/base-test.utils';
import { SubjectService } from './subject.service';
import { Subject } from './entities/subject.entity';
import { BadRequestException } from '@nestjs/common';
describe('SubjectService', () => {
  let service: SubjectService;
  const mockSubjectRepo = createMockRepository<Subject>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        { provide: getRepositoryToken(Subject), useValue: mockSubjectRepo },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
      ],
    }).compile();

    service = module.get<SubjectService>(SubjectService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test get all subjects
  describe('Find List Subjects API', () => {
    it('should return list of subjects', async () => {
      const mockSubjects = [{ id: 1 }, { id: 2 }];
      (mockSubjectRepo.find as jest.Mock).mockResolvedValue(mockSubjects);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });

    it('should throw subject.fetch_failed on error', async () => {
      (mockSubjectRepo.find as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.findAll()).rejects.toThrow('subject.fetch_failed');
    });
  });

  // Test get subject by ID
  describe('Find Subject By ID', () => {
    it('should return subject if found', async () => {
      const mockSubject = {
        id: 1,
        tests: [{ is_latest: true, is_published: true }],
      };
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(mockSubject);
      const result = await service.findOneById(1);
      expect(result).toBeDefined();
    });

    it('should throw subject_not_found_by_id if not found', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOneById(1)).rejects.toThrow(
        'subject.subject_not_found_by_id',
      );
    });
  });

  describe('Create Subject API', () => {
    const mockDto = { code: 'MATH', image_url: 'url', name: 'Mathematics' };
    const mockUser = { id: 1 };

    it('should create subject successfully', async () => {
      (mockSubjectRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      (mockSubjectRepo.create as jest.Mock).mockReturnValue(mockDto);
      (mockSubjectRepo.save as jest.Mock).mockResolvedValue(mockDto);

      const result = await service.create(mockDto, mockUser);
      expect(result).toBeDefined();
    });

    it('should throw code_existed if code already exists', async () => {
      (mockSubjectRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 99 });

      await expect(service.create(mockDto, mockUser)).rejects.toThrow(
        'subject.code_existed',
      );
    });

    it('should throw create_failed on unexpected error', async () => {
      (mockSubjectRepo.findOneBy as jest.Mock).mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.create(mockDto, mockUser)).rejects.toThrow(
        'subject.create_failed',
      );
    });

    it('should upload image if file is provided', async () => {
      const file = {
        buffer: Buffer.from('abc'),
        originalname: 'img.jpg',
      } as any;
      const dto = { ...mockDto, image_url: '' };
      const created = {
        ...dto,
        image_url: 'uploaded_url',
        creator_id: mockUser.id,
      };

      (mockSubjectRepo.findOneBy as jest.Mock).mockResolvedValue(null);
      mockCloudinaryService.uploadImage.mockResolvedValue('uploaded_url');
      (mockSubjectRepo.create as jest.Mock).mockReturnValue(created);
      (mockSubjectRepo.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(dto, mockUser, file);

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(result).toBeDefined();
      expect(result.image_url).toBe('uploaded_url');
    });
  });

  // Test update subject
  describe('Update Subject API', () => {
    const mockSubject = { id: 1, image_url: 'old_url' };
    const baseDto = { name: 'Updated subject' };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update subject successfully without file and keep existing image_url if missing in dto', async () => {
      const dto = { ...baseDto };
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(mockSubject);
      (mockSubjectRepo.merge as jest.Mock).mockReturnValue({
        ...mockSubject,
        ...dto,
        image_url: 'old_url',
      });
      (mockSubjectRepo.save as jest.Mock).mockResolvedValue({
        ...mockSubject,
        ...dto,
        image_url: 'old_url',
      });

      const result = await service.update(1, dto);
      expect(result.image_url).toBe('old_url');
    });

    it('should update subject with image_url from dto if provided', async () => {
      const dto = { ...baseDto, image_url: 'new_url' };
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(mockSubject);
      (mockSubjectRepo.merge as jest.Mock).mockReturnValue({
        ...mockSubject,
        ...dto,
      });
      (mockSubjectRepo.save as jest.Mock).mockResolvedValue({
        ...mockSubject,
        ...dto,
      });

      const result = await service.update(1, dto);
      expect(result.image_url).toBe('new_url');
    });

    it('should update subject and upload image if file is provided', async () => {
      const dto = { ...baseDto };
      const file = {
        buffer: Buffer.from(''),
        originalname: 'img.png',
      } as any;

      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(mockSubject);
      (mockCloudinaryService.uploadImage as jest.Mock).mockResolvedValue(
        'uploaded_url',
      );
      (mockSubjectRepo.merge as jest.Mock).mockReturnValue({
        ...mockSubject,
        ...dto,
        image_url: 'uploaded_url',
      });
      (mockSubjectRepo.save as jest.Mock).mockResolvedValue({
        ...mockSubject,
        ...dto,
        image_url: 'uploaded_url',
      });

      const result = await service.update(1, dto, file);
      expect(result.image_url).toBe('uploaded_url');
    });

    it('should throw subject_not_found_by_id if subject not found', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, baseDto)).rejects.toThrow(
        'subject.subject_not_found_by_id',
      );
    });

    it('should throw update_failed on unexpected error', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.update(1, baseDto)).rejects.toThrow(
        'subject.update_failed',
      );
    });
  });

  //Test soft delete subject
  describe('Soft Delete API', () => {
    const mockSubject = { id: 1, questions: [], tests: [] };

    it('should soft delete successfully when no dependencies', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(mockSubject);
      (mockSubjectRepo.softDelete as jest.Mock).mockResolvedValue({});

      const result = await service.softDelete(1);
      expect(result).toEqual({ message: 'subject.deleted_success' });
    });

    it('should throw subject_not_found_by_id if subject not found', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.softDelete(1)).rejects.toThrow(
        'subject.subject_not_found_by_id',
      );
    });

    it('should throw cannot_delete_subject_with_questions if subject has questions', async () => {
      const subjectWithQuestions = {
        ...mockSubject,
        questions: [{ id: 1 }],
      };
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(
        subjectWithQuestions,
      );

      await expect(service.softDelete(1)).rejects.toThrow(
        'subject.cannot_delete_subject_with_questions',
      );
    });

    it('should throw cannot_delete_subject_with_tests if subject has tests', async () => {
      const subjectWithTests = {
        ...mockSubject,
        tests: [{ id: 1 }],
      };
      (mockSubjectRepo.findOne as jest.Mock).mockResolvedValue(
        subjectWithTests,
      );

      await expect(service.softDelete(1)).rejects.toThrow(
        'subject.cannot_delete_subject_with_tests',
      );
    });

    it('should throw delete_failed on unknown error', async () => {
      (mockSubjectRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.softDelete(1)).rejects.toThrow(
        'subject.delete_failed',
      );
    });
    it('should rethrow BadRequestException in catch block', async () => {
      const mockError = new BadRequestException('custom.message');
      jest.spyOn(mockSubjectRepo, 'findOne').mockImplementation(() => {
        throw mockError;
      });

      await expect(service.softDelete(1)).rejects.toThrow('custom.message');
    });
  });
});
