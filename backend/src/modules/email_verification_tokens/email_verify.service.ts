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

@Injectable()
export class EmailVerifyService {
  private readonly emailTokenExpiresInMinutes: number;
  constructor(
    @InjectRepository(EmailVerificationToken)
    private emailVerifyRepo: Repository<EmailVerificationToken>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.emailTokenExpiresInMinutes = Number(
      process.env.EMAIL_TOKEN_EXPIRES_IN_MIN || 2,
    );
  }

  async createVerificationToken(
    userId: number,
    token: string,
    queryRunner?: QueryRunner,
  ) {
    const expiresAt = new Date(
      Date.now() +
        Number(process.env.EMAIL_TOKEN_EXPIRES_IN_MIN || 2) * 60 * 1000,
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
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    if (record.expires_at.getTime() < Date.now()) {
      await this.emailVerifyRepo.delete({ token });
      throw new Error('Token đã hết hạn');
    }
    const user = await this.userService.findById(record.user_id);
    user.email_verified_at = new Date();
    await this.userService.saveUser(user);
    await this.emailVerifyRepo.delete({ token });

    return 'Xác thực thành công!';
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (user.email_verified_at)
      throw new BadRequestException('Email đã xác thực');
    const token = generateToken();
    await this.createVerificationToken(user.id, token);
    await this.sendVerificationEmail(user.email, token);
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
      subject: 'Xác thực tài khoản',
      html: emailContent,
    });
  }
}
