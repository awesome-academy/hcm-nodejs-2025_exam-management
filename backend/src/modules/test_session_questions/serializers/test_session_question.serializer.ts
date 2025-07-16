import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionSerializer } from '@/modules/questions/serializers/question.serializer';
import { UserAnswerSerializer } from '@/modules/user_answers/serializers/user_answer.serializer';

export class AnswerSnapshotSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  answer_text: string;

  @ApiProperty()
  @Expose()
  is_correct: boolean;

  @ApiProperty()
  @Expose()
  explanation: string;
}

export class TestSessionQuestionSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  session_id: number;

  @ApiProperty()
  @Expose()
  question_id: number;

  @ApiProperty()
  @Expose()
  order_number: number;

  @ApiProperty({ type: () => QuestionSerializer, required: false })
  @Expose()
  @Type(() => QuestionSerializer)
  question?: QuestionSerializer;

  @ApiProperty({ type: [AnswerSnapshotSerializer], required: false })
  @Expose()
  @Type(() => AnswerSnapshotSerializer)
  answers_snapshot?: AnswerSnapshotSerializer[];

  @ApiProperty({ type: () => UserAnswerSerializer, required: false })
  @Expose()
  @Type(() => UserAnswerSerializer)
  user_answer?: UserAnswerSerializer;
}
