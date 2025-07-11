import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionSerializer } from '@/modules/questions/serializers/question.serializer';
import { UserAnswerSerializer } from '@/modules/user_answers/serializers/user_answer.serializer';

export class AnswerSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  question_id: number;

  @ApiProperty()
  @Expose()
  answer_text: string;

  @ApiProperty()
  @Expose()
  is_correct: boolean;

  @ApiProperty({ required: false })
  @Expose()
  explanation?: string;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;

  @ApiProperty({ type: () => QuestionSerializer })
  @Expose()
  @Type(() => QuestionSerializer)
  question: QuestionSerializer;

  @ApiProperty({ type: () => [UserAnswerSerializer] })
  @Expose()
  @Type(() => UserAnswerSerializer)
  user_answers: UserAnswerSerializer[];

  @ApiProperty()
  @Expose()
  is_active: boolean;
}
