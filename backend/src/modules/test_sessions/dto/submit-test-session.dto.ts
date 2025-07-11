import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsNumber()
  answerId: number;
}

export class SubmitTestSessionDto {
  @ApiProperty({ type: [SubmitAnswerDto] })
  @IsArray()
  answers: SubmitAnswerDto[];
}
