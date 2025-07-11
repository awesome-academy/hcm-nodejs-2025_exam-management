import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  question_id: number;

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

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
