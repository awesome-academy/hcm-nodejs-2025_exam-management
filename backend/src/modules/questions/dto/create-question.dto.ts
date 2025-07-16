import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsIn,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, DifficultyLevel } from '@/common/enums/question.enum';
import { CreateAnswerDto } from '@/modules/answers/dto/create-answer.dto';
import { Type } from 'class-transformer';

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

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  points: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(DifficultyLevel))
  difficulty_level: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ type: [CreateAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}
