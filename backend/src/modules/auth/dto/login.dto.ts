import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessage } from '@/common/enums/validation-message.enum';


export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: ValidationMessage.LOGIN_USERNAME_REQUIRED })
  @IsString()
  username: string;

  @ApiProperty() 
  @IsNotEmpty({ message: ValidationMessage.LOGIN_PASSWORD_REQUIRED })
  @IsString()
  password: string;
}

