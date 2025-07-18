import { ApiProperty } from '@nestjs/swagger';

export class QuestionStatsDto {
  @ApiProperty({ example: 10 })
  easy: number;

  @ApiProperty({ example: 5 })
  medium: number;

  @ApiProperty({ example: 3 })
  hard: number;
}
