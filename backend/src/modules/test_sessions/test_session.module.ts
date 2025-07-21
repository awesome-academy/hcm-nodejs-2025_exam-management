import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSession } from './entities/test_session.entity';
import { UserAnswer } from '@/modules/user_answers/entities/user_answer.entity';
import { TestSessionService } from './test_session.service';
import { TestSessionController } from './test_session.controller';
import { Answer } from '@/modules/answers/entities/answer.entity';
import { Question } from '@/modules/questions/entities/question.entity';
import { SharedModule } from '../shared/shared.module';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TestSession,
      UserAnswer,
      Answer,
      Question,
      TestSessionQuestion,
    ]),
    SharedModule,
  ],
  providers: [TestSessionService],
  controllers: [TestSessionController],
})
export class TestSessionModule {}
