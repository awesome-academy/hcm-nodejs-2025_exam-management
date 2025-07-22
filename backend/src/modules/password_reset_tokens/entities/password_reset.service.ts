import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './password_reset.entity';
import { Repository } from 'typeorm';
import { UserService } from '@/modules/users/user.service';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { generateToken } from '@/common/utils/token.util';
import { MailJob } from '@/common/jobs/mail/mail.job';

@Injectable()
export class PasswordResetService {
  private readonly resetTokenExpiresInMinutes = Number(
    process.env.EMAIL_TOKEN_EXPIRES_IN_MIN || 10,
  );

  constructor(
    @InjectRepository(PasswordResetToken)
    private resetRepo: Repository<PasswordResetToken>,
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly mailJob: MailJob,
  ) {}

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        await this.i18n.t('user.user_not_found_by_email'),
      );
    }

    const token = generateToken();
    const expiresAt = new Date(
      Date.now() + this.resetTokenExpiresInMinutes * 60 * 1000,
    );

    await this.resetRepo.save({ email, token, expires_at: expiresAt });

    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = await this.i18n.t('auth.password_reset_subject');

    await this.mailJob.sendResetPasswordMail({
      email,
      link,
      expiresInMinutes: this.resetTokenExpiresInMinutes,
      subject,
    });
    return await this.i18n.t('auth.reset_link_sent');
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const record = await this.resetRepo.findOne({ where: { token } });

    if (!record || record.expires_at.getTime() < Date.now()) {
      throw new BadRequestException(
        await this.i18n.t('auth.token_invalid_or_expired'),
      );
    }

    const user = await this.userService.findByEmail(record.email);
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.userService.saveUser(user);
    await this.resetRepo.delete({ token });

    return await this.i18n.t('auth.password_reset_success');
  }
}
