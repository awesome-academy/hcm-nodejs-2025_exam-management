import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RoleService } from '../roles/role.service';
import { EmailVerifyService } from '../email_verification_tokens/email_verify.service';
import { CloudinaryService } from '../shared/cloudinary.service';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import {
  createMockRepository,
  createMockEntityManager,
  createMockQueryRunner,
  createMockDataSource,
  mockI18nService,
  mockRequestContextService,
  mockCloudinaryService,
} from '@/test/utils/base-test.utils';
import { DataSource } from 'typeorm';

describe('UserService - register()', () => {
  let service: UserService;

  const mockUserRepo = createMockRepository<User>();
  const mockRoleService = {
    findByName: jest.fn(),
  };
  const mockEmailVerifyService = {
    createVerificationToken: jest.fn(),
    sendVerificationEmail: jest.fn(),
  };
  const mockManager = createMockEntityManager();
  const mockQueryRunner = createMockQueryRunner(mockManager);
  const mockDataSource = createMockDataSource(mockQueryRunner);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: RoleService, useValue: mockRoleService },
        { provide: EmailVerifyService, useValue: mockEmailVerifyService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register API', () => {
    const dto: RegisterDto = {
      username: 'Nhan',
      email: 'Nhan@example.com',
      password: '123456',
      full_name: 'Nhan Pro',
    };

    const mockUser = {
      id: 1,
      username: 'Nhan',
      email: 'Nhan@example.com',
      password_hash: 'hashed_password',
      full_name: 'Nhan Pro',
      role_id: 1,
    };

    it('should register user successfully', async () => {
      (mockManager.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      mockRoleService.findByName.mockResolvedValue({ id: 1 });
      const createdUser = { ...dto, password_hash: 'hashed', role_id: 1 };
      const savedUser = { id: 99, ...createdUser };

      (mockUserRepo.create as jest.Mock).mockReturnValue(createdUser);
      (mockManager.save as jest.Mock).mockResolvedValue(savedUser);
      mockEmailVerifyService.createVerificationToken.mockResolvedValue(
        undefined,
      );
      mockEmailVerifyService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.register(dto);

      expect(result.id).toBe(savedUser.id);
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should fail when username already exists', async () => {
      (mockManager.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      await expect(service.register(dto)).rejects.toThrow(
        'user.username_existed',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should fail when email already exists', async () => {
      (mockManager.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.register(dto)).rejects.toThrow('user.email_existed');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rollback and throw register_failed if unexpected error occurs', async () => {
      (mockManager.findOne as jest.Mock).mockResolvedValueOnce(null);
      mockRoleService.findByName.mockResolvedValue({ id: 1 });
      const createdUser = { ...dto, password_hash: 'hashed', role_id: 1 };
      (mockUserRepo.create as jest.Mock).mockReturnValue(createdUser);
      (mockManager.save as jest.Mock).mockRejectedValue(
        new Error('Unexpected DB error'),
      );
      await expect(service.register(dto)).rejects.toThrow(
        'user.register_failed',
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
