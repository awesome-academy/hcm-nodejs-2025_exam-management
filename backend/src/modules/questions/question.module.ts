import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { SharedModule } from '../shared/shared.module';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { Answer } from '../answers/entities/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, TestSessionQuestion, Answer]),
    SharedModule,
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
