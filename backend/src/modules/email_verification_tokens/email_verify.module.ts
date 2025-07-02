import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email_verify.entity';
import { EmailVerifyService } from './email_verify.service';
import { EmailVerifyController } from './email_verify.controller';
import { UserModule } from '../users/user.module';
import { SharedModule } from '@/modules/shared/shared.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken]),
    forwardRef(() => UserModule),
    SharedModule
  ],
  providers: [EmailVerifyService],
  controllers: [EmailVerifyController],
  exports: [EmailVerifyService],
})
export class EmailVerifyModule {}
