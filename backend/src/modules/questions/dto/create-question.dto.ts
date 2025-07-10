import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, DifficultyLevel } from '@/common/enums/question.enum';

export class CreateQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  subject_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question_text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(QuestionType))
  question_type: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parent_question_id?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  points: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(DifficultyLevel))
  difficulty_level: string;
}
