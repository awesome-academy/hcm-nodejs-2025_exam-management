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
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
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

  const mockUser = {
    id: 1,
    username: 'Nhan',
    email: 'Nhan@example.com',
    password_hash: 'hashed_password',
    full_name: 'Nhan Pro',
    role_id: 1,
  } as User;

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

  //  Test chức năng đăng ký người dùng mới thông qua API register()
  describe('Register API', () => {
    const dto: RegisterDto = {
      username: 'Nhan',
      email: 'Nhan@example.com',
      password: '123456',
      full_name: 'Nhan Pro',
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

  // Test chức năng tìm kiếm người dùng theo email
  describe('Find User By Email API', () => {
    it('should return user when email exists', async () => {
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw user_not_found_by_email if user not found', async () => {
      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(
        'user.user_not_found_by_email',
      );
    });

    it('should throw fetch_failed on unexpected error', async () => {
      (mockUserRepo.findOneBy as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );
      await expect(service.findByEmail('error@example.com')).rejects.toThrow(
        'user.fetch_failed',
      );
    });
  });

  // Test chức năng tìm kiếm người dùng theo username
  describe('Find User By Username API', () => {
    it('should return user when username exists', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');
      expect(result).toEqual(mockUser);
    });

    it('should throw user_not_found_by_username if user not found', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findByUsername('nouser')).rejects.toThrow(
        'user.user_not_found_by_username',
      );
    });

    it('should throw fetch_failed on unexpected error', async () => {
      (mockUserRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.findByUsername('erroruser')).rejects.toThrow(
        'user.fetch_failed',
      );
    });
  });

  // Test chức năng tìm kiếm người dùng theo ID
  describe('Find User By ID API', () => {
    it('should return user when id exists', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw user_not_found_by_id if user not found', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        'user.user_not_found_by_id',
      );
    });

    it('should throw fetch_failed on unexpected error', async () => {
      (mockUserRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.findById(1)).rejects.toThrow('user.fetch_failed');
    });
  });

  // Test chức năng lưu thông tin người dùng (saveUser)
  describe('Save User API', () => {
    it('should save user successfully', async () => {
      (mockUserRepo.save as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.saveUser(mockUser);
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw user.save_failed on unexpected error', async () => {
      (mockUserRepo.save as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(service.saveUser(mockUser)).rejects.toThrow(
        'user.save_failed',
      );
    });
  });

  // Test chức năng cập nhật hồ sơ người dùng (tên và ảnh đại diện)
  describe('Update Profile API', () => {
    const updatedUser = {
      ...mockUser,
      full_name: 'Updated Name',
      avatar_url: 'http://img.url/avatar.jpg',
    };

    it('should update full_name only when no file is provided', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockUser });
      (mockUserRepo.save as jest.Mock).mockResolvedValue({
        ...mockUser,
        full_name: 'Updated Name',
      });

      const result = await service.updateProfile(1, {
        full_name: 'Updated Name',
      });

      expect(result.full_name).toBe('Updated Name');
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'Updated Name' }),
      );
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should update avatar_url when file is provided', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image'),
        originalname: 'avatar.jpg',
      } as Express.Multer.File;

      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockUser });
      mockCloudinaryService.uploadImage.mockResolvedValue(
        'http://img.url/avatar.jpg',
      );
      (mockUserRepo.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateProfile(1, {}, mockFile);

      expect(result.avatar_url).toBe('http://img.url/avatar.jpg');
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(mockFile);
    });

    it('should update both full_name and avatar_url if both provided', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image'),
        originalname: 'avatar.jpg',
      } as Express.Multer.File;

      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockUser });
      mockCloudinaryService.uploadImage.mockResolvedValue(
        'http://img.url/avatar.jpg',
      );
      (mockUserRepo.save as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updateProfile(
        1,
        { full_name: 'Updated Name' },
        mockFile,
      );

      expect(result.full_name).toBe('Updated Name');
      expect(result.avatar_url).toBe('http://img.url/avatar.jpg');
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Updated Name',
          avatar_url: 'http://img.url/avatar.jpg',
        }),
      );
    });

    it('should throw user.update_failed if save fails', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockUser });
      (mockUserRepo.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(
        service.updateProfile(1, { full_name: 'Fail Name' }),
      ).rejects.toThrow('user.update_failed');
    });

    it('should rethrow BadRequestException directly', async () => {
      const err = new BadRequestException('user.invalid_profile');
      jest.spyOn(service, 'findById').mockResolvedValue({ ...mockUser });
      (mockUserRepo.save as jest.Mock).mockRejectedValue(err);

      await expect(
        service.updateProfile(1, { full_name: 'Invalid' }),
      ).rejects.toThrow('user.invalid_profile');
    });
  });

  // Test chức năng đổi mật khẩu người dùng
  describe('Change Password API', () => {
    const currentPwd = 'current_password';
    const newPwd = 'new_secure_password';

    let userWithPassword: User;

    beforeEach(async () => {
      const hashedCurrentPwd = await bcrypt.hash(currentPwd, 10);
      userWithPassword = {
        ...mockUser,
        password_hash: hashedCurrentPwd,
      };
    });
    it('should change password successfully when current password matches', async () => {
      userWithPassword = {
        ...mockUser,
        password_hash: 'hashed_current_password',
      };

      jest.spyOn(service, 'findById').mockResolvedValue(userWithPassword);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async (plain, hash) => {
        return plain === currentPwd && hash === 'hashed_current_password';
      });

      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue(
        'new_hashed_password',
      );

      (mockUserRepo.save as jest.Mock).mockResolvedValue({
        ...userWithPassword,
        password_hash: 'new_hashed_password',
      });

      const result = await service.changePassword(
        mockUser.id,
        currentPwd,
        newPwd,
      );

      expect(result).toBe('user.change_password_success');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        currentPwd,
        'hashed_current_password',
      );
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: 'new_hashed_password',
        }),
      );
    });

    it('should throw user.invalid_current_password when password does not match', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(userWithPassword);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, 'wrong_pass', newPwd),
      ).rejects.toThrow('user.invalid_current_password');
    });

    it('should throw user.change_password_failed on unexpected error', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new Error('DB error'));

      await expect(
        service.changePassword(mockUser.id, currentPwd, newPwd),
      ).rejects.toThrow('user.change_password_failed');
    });

    it('should rethrow BadRequestException directly', async () => {
      const customError = new BadRequestException(
        'user.invalid_current_password',
      );
      jest.spyOn(service, 'findById').mockResolvedValue(userWithPassword);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        throw customError;
      });

      await expect(
        service.changePassword(mockUser.id, currentPwd, newPwd),
      ).rejects.toThrow(customError);
    });
  });

  // Test chức năng lấy hồ sơ người dùng (getProfile)
  describe('Get Profile API', () => {
    it('should return user profile successfully', async () => {
      const userWithRole = {
        ...mockUser,
        role: { name: 'user' },
      };

      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(userWithRole);

      const result = await service.getProfile(1);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          full_name: mockUser.full_name,
        }),
      );
    });

    it('should throw user_not_found_by_id if user not found', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        'user.user_not_found_by_id',
      );
    });

    it('should throw user.fetch_failed on unexpected error', async () => {
      (mockUserRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getProfile(1)).rejects.toThrow('user.fetch_failed');
    });

    it('should rethrow BadRequestException directly', async () => {
      const customError = new BadRequestException('custom error');
      (mockUserRepo.findOne as jest.Mock).mockImplementation(() => {
        throw customError;
      });

      await expect(service.getProfile(1)).rejects.toThrow(customError);
    });
  });

  // Test chức năng lấy danh sách người dùng có vai trò "user"
  describe('Get Users List API', () => {
    it('should return list of users with role = user', async () => {
      const users = [
        { ...mockUser, id: 1, role: { name: 'user' } },
        { ...mockUser, id: 2, username: 'AnotherUser', role: { name: 'user' } },
      ];

      (mockUserRepo.find as jest.Mock).mockResolvedValue(users);

      const result = await service.getUsersList();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].username).toBe('AnotherUser');
    });

    it('should throw user.fetch_failed on unexpected error', async () => {
      (mockUserRepo.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.getUsersList()).rejects.toThrow('user.fetch_failed');
    });
  });

  // Test chức năng cập nhật trạng thái hoạt động của học sinh (is_active)
  describe('updateStatusStudent', () => {
    it('should update status successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser);
      (mockUserRepo.save as jest.Mock).mockResolvedValue({
        ...mockUser,
        is_active: true,
      });

      const result = await service.updateStatusStudent(1, true);

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          is_active: true,
        }),
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      const error = new BadRequestException('user.user_not_found_by_id');
      jest.spyOn(service, 'findById').mockRejectedValue(error);

      await expect(service.updateStatusStudent(1, true)).rejects.toThrow(
        'user.user_not_found_by_id',
      );
    });

    it('should throw user.update_status_failed on unexpected error', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUser as any);
      (mockUserRepo.save as jest.Mock).mockRejectedValue(
        new Error('DB failed'),
      );

      await expect(service.updateStatusStudent(1, true)).rejects.toThrow(
        'user.update_status_failed',
      );
    });
  });
});
