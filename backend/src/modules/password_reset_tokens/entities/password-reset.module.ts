import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@/modules/users/user.module';
import { PasswordResetToken } from './password_reset.entity';
import { PasswordResetService } from './password_reset.service';
import { PasswordResetController } from './password-reset.controller';
import { MailModule } from '@/common/jobs/mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken]),
    forwardRef(() => UserModule),
    MailModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
