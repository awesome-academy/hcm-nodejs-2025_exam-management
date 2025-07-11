import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SubjectSerializer } from '@/modules/subjects/serializers/subject.serializer';
import { TestSerializer } from '@/modules/tests/serializers/test.serializer';
import { QuestionSerializer } from '@/modules/questions/serializers/question.serializer';
import { TestSessionSerializer } from '@/modules/test_sessions/serializers/test_session.serializer';

export class UserSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  full_name: string;

  @ApiProperty({ required: false })
  @Expose()
  avatar_url?: string;

  @ApiProperty()
  @Expose()
  is_active: boolean;

  @ApiProperty({ required: false })
  @Expose()
  email_verified_at?: Date;

  @ApiProperty()
  @Expose()
  role_id: number;

  @Expose()
  @Transform(({ obj }) => obj.role?.name)
  @ApiProperty()
  role_name: string;

  @ApiProperty({ type: () => [SubjectSerializer] })
  @Expose()
  @Type(() => SubjectSerializer)
  subjects: SubjectSerializer[];

  @ApiProperty({ type: () => [TestSerializer] })
  @Expose()
  @Type(() => TestSerializer)
  tests: TestSerializer[];

  @ApiProperty({ type: () => [QuestionSerializer] })
  @Expose()
  @Type(() => QuestionSerializer)
  questions: QuestionSerializer[];

  @ApiProperty({ type: () => [TestSessionSerializer] })
  @Expose()
  @Type(() => TestSessionSerializer)
  test_sessions: TestSessionSerializer[];

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;
}
