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
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async login(data: LoginDto) {
    const user = await this.userService.findByUsername(data.username);
    const isMatch =
      user && (await bcrypt.compare(data.password, user.password_hash));

    if (!user || !isMatch) {
      throw new UnauthorizedException(await this.t('auth.invalid_credentials'));
    }

    if (!user.email_verified_at) {
      throw new BadRequestException(await this.t('auth.email_not_verified'));
    }

    if (!user.is_active) {
      throw new BadRequestException(await this.t('auth.account_inactive'));
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: plainToInstance(UserSerializer, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
