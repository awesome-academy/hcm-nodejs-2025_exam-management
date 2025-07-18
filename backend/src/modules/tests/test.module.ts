import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { SharedModule } from '../shared/shared.module';
import { Question } from '../questions/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, Question]),
    SharedModule,
  ],
  providers: [TestService],
  controllers: [TestController],
  exports: [TestService],
})
export class TestModule {}
