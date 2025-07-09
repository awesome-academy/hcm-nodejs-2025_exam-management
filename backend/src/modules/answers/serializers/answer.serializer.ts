import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}
