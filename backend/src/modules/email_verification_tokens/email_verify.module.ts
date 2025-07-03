import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email_verify.entity';
import { EmailVerifyService } from './email_verify.service';
import { EmailVerifyController } from './email_verify.controller';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken]),
    forwardRef(() => UserModule),
  ],
  providers: [EmailVerifyService],
  controllers: [EmailVerifyController],
  exports: [EmailVerifyService],
})
export class EmailVerifyModule {}
