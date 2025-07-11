import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTestQuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  question_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order_number: number;
}
