import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TEST_DESCRIPTION_MAX_LENGTH,
  TEST_TIME_MAX,
  TEST_TIME_MIN,
  TEST_TITLE_MAX_LENGTH,
  TEST_PASSING_SCORE_MAX,
  TEST_PASSING_SCORE_MIN,
} from '@/common/constants/test.constant';
import { ValidationMessage } from '@/common/enums/validation-message.enum';

export class CreateTestDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.TEST_TITLE_REQUIRED })
  @IsString()
  @MaxLength(TEST_TITLE_MAX_LENGTH, {
    message: ValidationMessage.TEST_TITLE_MAX,
  })
  title: string;

  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.TEST_TIME_REQUIRED })
  @IsNumber()
  @Min(TEST_TIME_MIN, { message: ValidationMessage.TEST_TIME_MIN })
  @Max(TEST_TIME_MAX, { message: ValidationMessage.TEST_TIME_MAX })
  time_limit: number;

  @IsNotEmpty({ message: ValidationMessage.TEST_PASSING_SCORE_REQUIRED })
  @IsNumber()
  @Min(TEST_PASSING_SCORE_MIN, {
    message: ValidationMessage.TEST_PASSING_SCORE_MIN,
  })
  @Max(TEST_PASSING_SCORE_MAX, {
    message: ValidationMessage.TEST_PASSING_SCORE_MAX,
  })
  @ApiProperty()
  passing_score: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  subject_id: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(TEST_DESCRIPTION_MAX_LENGTH, {
    message: ValidationMessage.TEST_DESCRIPTION_MAX,
  })
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
