import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionSerializer } from '@/modules/questions/serializers/question.serializer';
import { TestSerializer } from '@/modules/tests/serializers/test.serializer';
export class TestQuestionSerializer {
  @ApiProperty()
  @Expose()
  test_id: number;

  @ApiProperty()
  @Expose()
  question_id: number;

  @ApiProperty()
  @Expose()
  order_number: number;

  @ApiProperty({ type: () => QuestionSerializer })
  @Expose()
  @Type(() => QuestionSerializer)
  question: QuestionSerializer;

  @ApiProperty({ type: () => TestSerializer })
  @Expose()
  @Type(() => TestSerializer)
  test: TestSerializer;
}
