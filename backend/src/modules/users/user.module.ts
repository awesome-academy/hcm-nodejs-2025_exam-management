import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RoleModule } from '../roles/role.module';
import { EmailVerifyModule } from '../email_verification_tokens/email_verify.module';
import { SharedModule } from '@/modules/shared/shared.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), RoleModule, EmailVerifyModule, SharedModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}

