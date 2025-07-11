import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { SubjectSerializer } from '@/modules/subjects/serializers/subject.serializer';
import { AnswerSerializer } from '@/modules/answers/serializers/answer.serializer';
import { TestQuestionSerializer } from '@/modules/test_questions/serializers/test_question.serializer';
export class QuestionSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  subject_id: number;

  @ApiProperty()
  @Expose()
  question_text: string;

  @ApiProperty()
  @Expose()
  question_type: string;

  @ApiProperty()
  @Expose()
  points: number;

  @ApiProperty()
  @Expose()
  difficulty_level: string;

  @ApiProperty()
  @Expose()
  creator_id: number;

  @ApiProperty({ type: () => UserSerializer })
  @Expose()
  @Type(() => UserSerializer)
  creator: UserSerializer;

  @ApiProperty({ type: () => SubjectSerializer })
  @Expose()
  @Type(() => SubjectSerializer)
  subject: SubjectSerializer;

  @ApiProperty({ type: () => [AnswerSerializer] })
  @Expose()
  @Type(() => AnswerSerializer)
  answers: AnswerSerializer[];

  @ApiProperty({ type: () => [TestQuestionSerializer] })
  @Type(() => TestQuestionSerializer)
  test_questions: TestQuestionSerializer[];

  @ApiProperty({ type: String })
  @Expose()
  get subject_name(): string {
    return this.subject?.name || '';
  }

  @ApiProperty({ type: String })
  @Expose()
  created_at: Date;

  @ApiProperty({ type: String })
  @Expose()
  updated_at: Date;

  @ApiProperty()
  @Expose()
  is_active: boolean;
}
