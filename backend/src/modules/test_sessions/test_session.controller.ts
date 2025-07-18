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
import {
  TestSessionQuestionSerializer,
  AnswerSnapshotSerializer,
} from '../test_session_questions/serializers/test_session_question.serializer';

@ApiTags('Test Session')
@ApiExtraModels(
  TestSessionSerializer,
  TestSessionQuestionSerializer,
  AnswerSnapshotSerializer,
)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('test-sessions')
export class TestSessionController {
  constructor(private readonly testSessionService: TestSessionService) {}

  //Tạo một phiên làm bài mới (test session)
  @Post()
  @ApiResponseData(TestSessionSerializer)
  async create(@Body() dto: CreateTestSessionDto, @Req() req: any) {
    const data = await this.testSessionService.createSession(dto, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  //Nộp bài thi (submit test session)
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

  // User xem chi tiết bài thi sau khi thi
  @Get(':id')
  @ApiResponseData(TestSessionSerializer)
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const data = await this.testSessionService.getSessionById(id, req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  // Lấy tất cả lịch sử bài thi của user
  @Get('history/me')
  @ApiResponseDataArray(TestSessionSerializer)
  async history(@Req() req: any) {
    const data = await this.testSessionService.getSessionHistory(req.user);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  // Láy tất cả lịch sử bài thi của tất cả học viên
  @Get('suppervisor/all')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseDataArray(TestSessionSerializer)
  async findAllAdmin() {
    const data = await this.testSessionService.getAllSessionsForAdmin();
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  // Supervisor xem chi tiết một bài thi user trong lịch sử
  @Get('raw/supervisor/:id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(TestSessionSerializer)
  async findDetailRawByAdmin(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testSessionService.getSessionDetailRawByAdmin(id);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  // User tự xem chi tiết một bài thi trong lịch sử
  @Get('raw/:id')
  @ApiResponseData(TestSessionSerializer)
  async findDetailRawByUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    const data = await this.testSessionService.getSessionDetailRawByUser(
      id,
      req.user,
    );
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get(':id/questions')
  @ApiResponseDataArray(TestSessionQuestionSerializer)
  async getSessionQuestions(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testSessionService.getSessionQuestions(id);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
