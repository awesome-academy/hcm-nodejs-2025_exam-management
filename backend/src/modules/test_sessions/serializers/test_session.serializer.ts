import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { TestSerializer } from '@/modules/tests/serializers/test.serializer';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { UserAnswerSerializer } from '@/modules/user_answers/serializers/user_answer.serializer';
import { TestSessionQuestionSerializer } from '@/modules/test_session_questions/serializers/test_session_question.serializer';

export class TestSessionSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  test_id: number;

  @ApiProperty()
  @Expose()
  user_id: number;

  @ApiProperty()
  @Expose()
  started_at: Date;

  @ApiProperty({ required: false })
  @Expose()
  submitted_at?: Date;

  @ApiProperty({ required: false })
  @Expose()
  score?: number;

  @ApiProperty({ required: false })
  @Expose()
  time_spent?: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  is_completed: boolean;

  @ApiProperty()
  @Expose()
  auto_graded: boolean;

  @ApiProperty({ required: false })
  @Expose()
  supervisor_id?: number;

  @ApiProperty({ type: () => TestSerializer })
  @Expose()
  @Type(() => TestSerializer)
  test: TestSerializer;

  @ApiProperty({ type: () => UserSerializer })
  @Expose()
  @Type(() => UserSerializer)
  user: UserSerializer;

  @ApiProperty({ type: () => [UserAnswerSerializer] })
  @Expose()
  @Type(() => UserAnswerSerializer)
  user_answers: UserAnswerSerializer[];

  @ApiProperty({ type: () => [TestSessionQuestionSerializer] })
  @Expose()
  @Type(() => TestSessionQuestionSerializer)
  test_session_questions: TestSessionQuestionSerializer[];
}
