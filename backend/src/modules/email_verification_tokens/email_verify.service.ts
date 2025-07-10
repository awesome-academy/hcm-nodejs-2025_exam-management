import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { EmailVerificationToken } from './entities/email_verify.entity';
import * as nodemailer from 'nodemailer';
import { UserService } from '../users/user.service';
import { generateToken } from '../../common/utils/token.util';
import { getEmailVerificationTemplate } from '@/common/templates/email-verification.template';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';

@Injectable()
export class EmailVerifyService {
  private readonly emailTokenExpiresInMinutes: number;

  constructor(
    @InjectRepository(EmailVerificationToken)
    private emailVerifyRepo: Repository<EmailVerificationToken>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {
    this.emailTokenExpiresInMinutes = Number(
      process.env.EMAIL_TOKEN_EXPIRES_IN_MIN || 2,
    );
  }

  private get lang() {
    return this.context.getLang() || 'vi';
  }

  private async t(key: string): Promise<string> {
    return (await this.i18n.translate(key, { lang: this.lang })) as string;
  }

  async createVerificationToken(
    userId: number,
    token: string,
    queryRunner?: QueryRunner,
  ) {
    const expiresAt = new Date(
      Date.now() + this.emailTokenExpiresInMinutes * 60 * 1000,
    );

    const tokenRecord = this.emailVerifyRepo.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });

    if (queryRunner) {
      await queryRunner.manager.save(EmailVerificationToken, tokenRecord);
    } else {
      await this.emailVerifyRepo.save(tokenRecord);
    }
  }

  async verifyEmail(token: string): Promise<string> {
    const record = await this.emailVerifyRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!record) {
      throw new BadRequestException(
        await this.t('emailVerify.token_invalid_or_expired'),
      );
    }

    if (record.expires_at.getTime() < Date.now()) {
      await this.emailVerifyRepo.delete({ token });
      throw new BadRequestException(await this.t('emailVerify.token_expired'));
    }

    const user = await this.userService.findById(record.user_id);
    user.email_verified_at = new Date();
    await this.userService.saveUser(user);
    await this.emailVerifyRepo.delete({ token });

    return await this.t('emailVerify.email_verified_success');
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(await this.t('user.user_not_found_by_email'));
    }

    if (user.email_verified_at) {
      throw new BadRequestException(
        await this.t('emailVerify.email_already_verified'),
      );
    }

    const token = generateToken();
    await this.createVerificationToken(user.id, token);
    await this.sendVerificationEmail(user.email, token);

    await this.t('emailVerify.resend_success');
  }

  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const verifyLink = `${process.env.BACKEND_URL}/emailVerify/confirm?token=${token}`;
    const emailContent = getEmailVerificationTemplate(
      verifyLink,
      this.emailTokenExpiresInMinutes,
    );

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject: await this.t('emailVerify.email_verify_subject'),
      html: emailContent,
    });
  }
}
