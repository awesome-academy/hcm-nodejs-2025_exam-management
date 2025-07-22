import { Controller, Post, Body } from '@nestjs/common';
import { PasswordResetService } from './password_reset.service';
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly resetService: PasswordResetService) {}

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const message = await this.resetService.requestPasswordReset(email);
    return { message };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; new_password: string }) {
    const message = await this.resetService.resetPassword(
      body.token,
      body.new_password,
    );
    return { message };
  }
}
