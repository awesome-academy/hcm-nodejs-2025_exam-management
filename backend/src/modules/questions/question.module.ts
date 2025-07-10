import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Question]), SharedModule],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
