import {
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeEssayItemDto {
  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsNumber()
  points: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class GradeEssayDto {
  @ApiProperty({
    type: [GradeEssayItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeEssayItemDto)
  updates: GradeEssayItemDto[];
}
