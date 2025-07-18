import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { SharedModule } from '../shared/shared.module';
import { TestSessionQuestion } from '../test_session_questions/entities/test_session_question.entity';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, TestSessionQuestion,Question]), SharedModule],
  providers: [AnswerService],
  controllers: [AnswerController],
})
export class AnswerModule {}