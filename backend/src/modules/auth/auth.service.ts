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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private get lang(): string {
    return this.context.getLang() || 'vi';
  }

  private async t(key: string): Promise<string> {
    return (await this.i18n.translate(key, { lang: this.lang })) as string;
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
