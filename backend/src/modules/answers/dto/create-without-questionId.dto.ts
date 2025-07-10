import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerWithoutQuestionIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer_text: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  explanation?: string;
}
