import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { SubjectSerializer } from '@/modules/subjects/serializers/subject.serializer';
import { TestSessionSerializer } from '@/modules/test_sessions/serializers/test_session.serializer';

export class TestSerializer {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  subject_id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  time_limit: number;

  @ApiProperty()
  @Expose()
  passing_score: number;

  @ApiProperty()
  @Expose()
  is_published: boolean;

  @ApiProperty()
  @Expose()
  is_latest: boolean;

  @ApiProperty()
  @Expose()
  version: number;

  @ApiProperty()
  @Expose()
  question_count: number;

  @ApiProperty()
  @Expose()
  easy_question_count: number;

  @ApiProperty()
  @Expose()
  medium_question_count: number;

  @ApiProperty()
  @Expose()
  hard_question_count: number;

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
