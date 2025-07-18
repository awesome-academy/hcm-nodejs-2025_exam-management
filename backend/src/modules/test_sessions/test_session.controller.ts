import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Get,
  Req,
} from '@nestjs/common';
import { TestSessionService } from './test_session.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { SubmitTestSessionDto } from './dto/submit-test-session.dto';
import { TestSessionSerializer } from './serializers/test_session.serializer';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@/common/enums/role.enum';
import { Role } from '@/common/decorators/role.decorator';

@ApiTags('Test Session')
@ApiExtraModels(TestSessionSerializer)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-sessions')
export class TestSessionController {
  constructor(private readonly testSessionService: TestSessionService) {}

  @Post()
  @ApiResponseData(TestSessionSerializer)
  async create(@Body() dto: CreateTestSessionDto, @Req() req: any) {
    const data = await this.testSessionService.createSession(dto, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Post(':id/submit')
  @ApiResponseData(TestSessionSerializer)
  async submit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitTestSessionDto,
    @Req() req: any,
  ) {
    const data = await this.testSessionService.submitSession(id, dto, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get('history/me')
  @ApiResponseDataArray(TestSessionSerializer)
  async history(@Req() req: any) {
    const data = await this.testSessionService.getSessionHistory(req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get(':id/history')
  @ApiResponseData(TestSessionSerializer)
  async findByIdRaw(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const data = await this.testSessionService.getSessionByIdRaw(id, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get(':id')
  @ApiResponseData(TestSessionSerializer)
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const data = await this.testSessionService.getSessionById(id, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get('suppervisor/all')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseDataArray(TestSessionSerializer)
  async findAllAdmin() {
    const data = await this.testSessionService.getAllSessionsForAdmin();
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get('suppervisor/:id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(TestSessionSerializer)
  async findDetailAdmin(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testSessionService.getSessionDetailByAdmin(id);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
