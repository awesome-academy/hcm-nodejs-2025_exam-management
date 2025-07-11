import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TestQuestionService } from './test_question.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Role } from '@/common/decorators/role.decorator';
import { UserRole } from '@/common/enums/role.enum';
import { ApiTags, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { TestQuestionSerializer } from './serializers/test_question.serializer';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { ResponseData } from '@/common/classes/response.class';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { CreateBulkTestQuestionDto } from './dto/create-bulk-test-question.dto';
import { MessageResponseDto } from '@/common/dto/message-response.dto';

@ApiTags('Test Question')
@ApiExtraModels(TestQuestionSerializer, MessageResponseDto)
@Controller('test-questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestQuestionController {
  constructor(private readonly testQuestionService: TestQuestionService) {}

  @Get('doing/:testId')
  @ApiResponseDataArray(TestQuestionSerializer)
  async findForDoingTest(
    @Param('testId', ParseIntPipe) testId: number,
  ): Promise<ResponseData<TestQuestionSerializer[]>> {
    const data = await this.testQuestionService.findForDoingTest(testId);
    return new ResponseData<TestQuestionSerializer[]>(
      data,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Get('test/:testId')
  @ApiResponseDataArray(TestQuestionSerializer)
  async findByTestId(
    @Param('testId', ParseIntPipe) testId: number,
  ): Promise<ResponseData<TestQuestionSerializer[]>> {
    const data = await this.testQuestionService.findByTestId(testId);
    return new ResponseData<TestQuestionSerializer[]>(
      data,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Post('bulk/:testId')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: CreateBulkTestQuestionDto })
  @ApiResponseDataArray(TestQuestionSerializer)
  async createBulk(
    @Param('testId', ParseIntPipe) testId: number,
    @Body() body: CreateBulkTestQuestionDto,
  ): Promise<ResponseData<TestQuestionSerializer[]>> {
    const data = await this.testQuestionService.createBulk(testId, body);
    return new ResponseData<TestQuestionSerializer[]>(
      data,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }
  @Delete(':testId/:questionId')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async delete(
    @Param('testId', ParseIntPipe) testId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
  ): Promise<ResponseData<MessageResponseDto>> {
    const message = await this.testQuestionService.delete(testId, questionId);
    return new ResponseData<MessageResponseDto>(
      { message },
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }
}
