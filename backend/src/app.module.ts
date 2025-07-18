import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { I18nModule, I18nJsonLoader } from 'nestjs-i18n';
import { CustomAcceptLanguageResolver } from './modules/shared/i18n/custom-accept-language.resolver';
import * as path from 'path';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailVerifyModule } from './modules/email_verification_tokens/email_verify.module';

import { RequestContextService } from './modules/shared/request-context.service';
import { SubjectModule } from './modules/subjects/subject.module';
import { QuestionModule } from './modules/questions/question.module';
import { TestModule } from './modules/tests/test.module';
import { TestSessionModule } from './modules/test_sessions/test_session.module';
import { AnswerModule } from './modules/answers/answer.module';


@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      fallbacks: {
        'en-US': 'en',
        'vi-VN': 'vi',
        en: 'en',
        vi: 'vi',
      },
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
        flatten: true,
      },
      resolvers: [CustomAcceptLanguageResolver],
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    UserModule,
    AuthModule,
    EmailVerifyModule,
    SubjectModule,
    QuestionModule,
    TestModule,
    TestSessionModule,
    AnswerModule
  ],
  controllers: [AppController],
  providers: [AppService, RequestContextService],
})
export class AppModule {}
