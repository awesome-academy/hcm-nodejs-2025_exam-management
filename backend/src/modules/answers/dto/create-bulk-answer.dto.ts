import { CreateAnswerWithoutQuestionIdDto } from './create-without-questionId.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBulkAnswerDto {
  @ApiProperty({ type: [CreateAnswerWithoutQuestionIdDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerWithoutQuestionIdDto)
  answers: CreateAnswerWithoutQuestionIdDto[];
}
