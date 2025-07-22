import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/common/constants/validation.constant';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  current_password: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  new_password: string;
}
