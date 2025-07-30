import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password_reset.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { PasswordResetToken } from './password_reset.entity';
import {
  createMockRepository,
  mockI18nService,
  mockRequestContextService,
} from '@/test/utils/base-test.utils';
import { MailJob } from '@/common/jobs/mail/mail.job';
import { UserService } from '@/modules/users/user.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  const mockPasswordResetRepo = createMockRepository<PasswordResetToken>();

  const mockUserService = {
    findByEmail: jest.fn(),
    saveUser: jest.fn(),
  };

  const mockMailJob = {
    sendResetPasswordMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockPasswordResetRepo,
        },
        { provide: UserService, useValue: mockUserService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: RequestContextService, useValue: mockRequestContextService },
        { provide: MailJob, useValue: mockMailJob },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Send Mail To Reset Password', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset('notfound@test.com'),
      ).rejects.toThrow('user.user_not_found_by_email');
    });

    it('should create token and send email successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue({ email: 'test@test.com' });
      (mockPasswordResetRepo.save as jest.Mock).mockResolvedValue({});
      mockMailJob.sendResetPasswordMail.mockResolvedValue(true);

      const result = await service.requestPasswordReset('test@test.com');

      expect(mockPasswordResetRepo.save).toHaveBeenCalled();
      expect(mockMailJob.sendResetPasswordMail).toHaveBeenCalled();
      expect(result).toBe('auth.reset_link_sent');
    });
  });

  describe('Reset Password', () => {
    it('should throw BadRequestException if token not found', async () => {
      (mockPasswordResetRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid_token', '123456'),
      ).rejects.toThrow('auth.token_invalid_or_expired');
    });

    it('should throw BadRequestException if token expired', async () => {
      (mockPasswordResetRepo.findOne as jest.Mock).mockResolvedValue({
        token: 'abc',
        email: 'test@test.com',
        expires_at: new Date(Date.now() - 10000),
      });

      await expect(service.resetPassword('abc', '123456')).rejects.toThrow(
        'auth.token_invalid_or_expired',
      );
    });

    it('should reset password successfully and delete token', async () => {
      const mockUser = { email: 'test@mail.com', password_hash: '' };

      (mockPasswordResetRepo.findOne as jest.Mock).mockResolvedValue({
        token: 'valid_token',
        email: 'test@mail.com',
        expires_at: new Date(Date.now() + 10000),
      });
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.saveUser.mockResolvedValue(true);
      (mockPasswordResetRepo.delete as jest.Mock).mockResolvedValue(true);

      const result = await service.resetPassword('valid_token', 'newPass123');

      expect(result).toBe('auth.password_reset_success');
      expect(mockUserService.saveUser).toHaveBeenCalled();
      expect(mockPasswordResetRepo.delete).toHaveBeenCalledWith({
        token: 'valid_token',
      });
    });
  });
});
