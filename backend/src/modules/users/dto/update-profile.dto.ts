import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
