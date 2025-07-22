import { Controller, Post, Body, Put, Req, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { UserSerializer } from './serializers/user.serializer';
import { ApiBody, ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { ApiResponseData } from '@/common/decorators/api-response.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
@ApiTags('User')
@Controller('users')
@ApiExtraModels(UserSerializer)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiResponseData(UserSerializer)
  async register(
    @Body() data: RegisterDto,
  ): Promise<ResponseData<UserSerializer>> {
    const user = await this.userService.register(data);
    return new ResponseData(user, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponseData(UserSerializer)
  @UseInterceptors(FileInterceptor('file'))
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ): Promise<ResponseData<any>> {
    const updated = await this.userService.updateProfile(
      req.user.id,
      dto,
      file,
    );
    return new ResponseData(updated, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiResponseData(MessageResponseDto)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ): Promise<ResponseData<{ message: string }>> {
    const message = await this.userService.changePassword(
      req.user.id,
      dto.current_password,
      dto.new_password,
    );

    return new ResponseData(
      { message },
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponseData(UserSerializer)
  async getProfile(@Req() req: any): Promise<ResponseData<UserSerializer>> {
    const user = await this.userService.getProfile(req.user.id);
    return new ResponseData(user, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
