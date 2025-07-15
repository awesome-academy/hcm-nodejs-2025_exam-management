import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TestSessionSerializer } from '@/modules/test_sessions/serializers/test_session.serializer';
import { QuestionSerializer } from '@/modules/questions/serializers/question.serializer';
import { AnswerSerializer } from '@/modules/answers/serializers/answer.serializer';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';

export class UserAnswerSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  session_id: number;

  @ApiProperty()
  @Expose()
  question_id: number;

  @ApiProperty({ required: false })
  @Expose()
  answer_id?: number;

  @ApiProperty({ required: false })
  @Expose()
  answer_text?: string;

  @ApiProperty()
  @Expose()
  is_correct: boolean;

  @ApiProperty({ required: false })
  @Expose()
  points_earned?: number;

  @ApiProperty({ required: false })
  @Expose()
  grader_id?: number;

  @ApiProperty({ required: false })
  @Expose()
  graded_at?: Date;

  @ApiProperty({ type: () => TestSessionSerializer })
  @Expose()
  @Type(() => TestSessionSerializer)
  session: TestSessionSerializer;

  @ApiProperty({ type: () => QuestionSerializer })
  @Expose()
  @Type(() => QuestionSerializer)
  question: QuestionSerializer;

  @ApiProperty({ type: () => AnswerSerializer, required: false })
  @Expose()
  @Type(() => AnswerSerializer)
  answer?: AnswerSerializer;

  @ApiProperty({ type: () => UserSerializer, required: false })
  @Expose()
  @Type(() => UserSerializer)
  grader?: UserSerializer;

  @ApiProperty({ required: false })
  @Expose()
  question_text_snapshot?: string;

  @ApiProperty({ required: false })
  @Expose()
  answer_text_snapshot?: string;

  @ApiProperty({ required: false })
  @Expose()
  answer_is_correct_snapshot?: boolean;

  @ApiProperty({ required: false, type: [Object] })
  @Expose()
  question_answers_snapshot?: any[];
}
