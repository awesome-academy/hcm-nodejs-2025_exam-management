import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerifyModule } from './modules/email_verification_tokens/email_verify.module';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    UserModule,
    AuthModule,
    EmailVerifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
