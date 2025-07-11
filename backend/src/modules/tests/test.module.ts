import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Test]), SharedModule],
  providers: [TestService],
  controllers: [TestController],
  exports: [TestService],
})
export class TestModule {}
