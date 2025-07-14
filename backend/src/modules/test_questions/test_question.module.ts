import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestQuestion } from './entities/test_question.entity';
import { TestQuestionService } from './test_question.service';
import { TestQuestionController } from './test_question.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([TestQuestion]), SharedModule],
  providers: [TestQuestionService],
  controllers: [TestQuestionController],
  exports: [TestQuestionService],
})
export class TestQuestionModule {}
