import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { UserSerializer } from './serializers/user.serializer';
import { ApiBody, ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { ApiResponseData } from '@/common/decorators/api-response.decorator';

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
}
