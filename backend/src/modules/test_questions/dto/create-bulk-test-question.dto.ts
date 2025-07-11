import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateTestQuestionDto } from './create-test-question.dto';

export class CreateBulkTestQuestionDto {
  @ApiProperty({ type: [CreateTestQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestQuestionDto)
  questions: CreateTestQuestionDto[];
}
