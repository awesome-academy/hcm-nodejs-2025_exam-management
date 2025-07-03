import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UserSerializer } from '../users/serializers/user.serializer';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(data: LoginDto) {
    const user = await this.userService.findByUsername(data.username);
    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu');
    }

    if (!user.email_verified_at) {
      throw new BadRequestException('Tài khoản chưa xác thực email.');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: plainToInstance(UserSerializer, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
