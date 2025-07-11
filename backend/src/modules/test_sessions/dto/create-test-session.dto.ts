import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTestSessionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  testId: number;
}
