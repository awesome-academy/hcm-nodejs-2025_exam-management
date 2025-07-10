import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserSerializer } from '@/modules/users/serializers/user.serializer';
import { SubjectSerializer } from '@/modules/subjects/serializers/subject.serializer';

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

  @ApiProperty({ required: false })
  @Expose()
  parent_question_id?: number;

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
}
