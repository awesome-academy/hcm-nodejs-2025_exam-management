import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Answer]), SharedModule],
  providers: [AnswerService],
  controllers: [AnswerController],
})
export class AnswerModule {}
