import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<ResponseData<LoginResponseDto>> {
    const result = await this.authService.login(dto);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
