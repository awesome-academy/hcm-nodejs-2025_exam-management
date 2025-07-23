import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindQuestionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subject_id?: number;

  @IsOptional()
  @IsString()
  question_type?: string;

  @IsOptional()
  @IsString()
  question_text?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  creator_id?: number;
}
