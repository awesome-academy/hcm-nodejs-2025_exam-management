import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { withBaseProviders } from '@/test/utils/base-test.utils';
import * as bcrypt from 'bcrypt';
describe('AuthService', () => {
  let service: AuthService;
  const mockUserService = {
    findByUsername: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  };

  const mockUser = {
    id: 1,
    username: 'testuser',
    password_hash: 'hashed_password',
    email_verified_at: new Date(),
    is_active: true,
    role: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: withBaseProviders([
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ]),
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Login API', () => {
    it('should login successfully with correct credentials', async () => {
      const loginDto = { username: 'testuser', password: 'correct_password' };
      mockUserService.findByUsername.mockReturnValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockReturnValue(true);

      const result = await service.login(loginDto);
      expect(mockUserService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({
        access_token: 'fake-jwt-token',
        user: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException if user not found or password mismatch', async () => {
      const loginDto = { username: 'notfound', password: 'wrong' };

      mockUserService.findByUsername.mockReturnValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.invalid_credentials'
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto = { username: 'testuser', password: 'wrong' };

      mockUserService.findByUsername.mockReturnValue(mockUser);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockReturnValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.invalid_credentials'
      );
    });

    it('should throw BadRequestException if email not verified', async () => {
      const loginDto = { username: 'testuser', password: 'correct_password' };

      mockUserService.findByUsername.mockReturnValue({
        ...mockUser,
        email_verified_at: null,
      });
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockReturnValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.email_not_verified'
      );
    });

    it('should throw BadRequestException if account is inactive', async () => {
      const loginDto = { username: 'testuser', password: 'correct_password' };
      mockUserService.findByUsername.mockReturnValue({
        ...mockUser,
        is_active: false,
      });
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockReturnValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        'auth.account_inactive'
      );
    });
  });
});
