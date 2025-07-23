import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsNumber()
  answerId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  answer_text?: string;
}

export class SubmitTestSessionDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  answers: SubmitAnswerDto[];
}
