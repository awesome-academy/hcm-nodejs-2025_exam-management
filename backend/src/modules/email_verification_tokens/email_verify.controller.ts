import { Controller, Get, Query, Res, Post, Body } from '@nestjs/common';
import { EmailVerifyService } from './email_verify.service';
import { Response } from 'express';

@Controller('emailVerify')
export class EmailVerifyController {
  constructor(private readonly emailVerifyService: EmailVerifyService) {}

  @Get('confirm')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.emailVerifyService.verifyEmail(token);
      return res.redirect(`${process.env.FRONTEND_URL}/login?verify=success`);
    } catch (err) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verify=fail&message=${encodeURIComponent(err.message)}`,
      );
    }
  }
  @Post('resend')
  async resend(@Body('email') email: string) {
    const message =
      await this.emailVerifyService.resendVerificationEmail(email);
    return { message };
  }
}
