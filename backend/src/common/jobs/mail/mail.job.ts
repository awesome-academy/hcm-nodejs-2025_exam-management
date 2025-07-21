import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailJob {
  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async sendResetPasswordMail(data: {
    email: string;
    link: string;
    expiresInMinutes: number;
    subject: string;
  }) {
    await this.mailQueue.add('send_reset_password', data, {
      attempts: Number(process.env.MAIL_RETRY_ATTEMPTS),
      backoff: Number(process.env.MAIL_RETRY_BACKOFF),
    });
  }
}
