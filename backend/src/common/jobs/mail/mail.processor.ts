import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { getPasswordResetTemplate } from '@/common/templates/password-reset.template';

@Processor('mail')
export class MailProcessor {
  @Process('send_reset_password')
  async handleResetMail(job: Job) {
    const { email, link, expiresInMinutes, subject } = job.data;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const html = getPasswordResetTemplate(link, expiresInMinutes);

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });
  }
}
