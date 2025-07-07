import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/common/constants/validation.constant';
import { ValidationMessage } from '@/common/enums/validation-message.enum';

export class RegisterDto {
  @ApiProperty()
  @IsString({ message: ValidationMessage.USERNAME_REQUIRED })
  @IsNotEmpty({ message: ValidationMessage.USERNAME_REQUIRED })
  @MinLength(USERNAME_MIN_LENGTH, { message: ValidationMessage.USERNAME_MIN })
  @MaxLength(USERNAME_MAX_LENGTH, { message: ValidationMessage.USERNAME_MAX })
  username: string;

  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.EMAIL_INVALID })
  @IsNotEmpty({ message: ValidationMessage.EMAIL_REQUIRED })
  email: string;

  @ApiProperty()
  @IsString({ message: ValidationMessage.PASSWORD_REQUIRED })
  @IsNotEmpty({ message: ValidationMessage.PASSWORD_REQUIRED })
  @MinLength(PASSWORD_MIN_LENGTH, { message: ValidationMessage.PASSWORD_MIN })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: ValidationMessage.PASSWORD_MAX })
  password: string;

  @ApiProperty()
  @IsString({ message: ValidationMessage.FULLNAME_REQUIRED })
  @IsNotEmpty({ message: ValidationMessage.FULLNAME_REQUIRED })
  full_name: string;
}

