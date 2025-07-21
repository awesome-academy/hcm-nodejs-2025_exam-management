import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionSerializer } from './serializers/question.serializer';
import { ResponseData } from '@/common/classes/response.class';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@/common/decorators/role.decorator';
import { UserRole } from '@/common/enums/role.enum';
import { ApiTags, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { QuestionStatsDto } from './dto/question-stats.dto';

import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { MessageResponseDto } from '@/common/dto/message-response.dto';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';

@ApiTags('Question')
@ApiExtraModels(QuestionSerializer, MessageResponseDto, QuestionStatsDto)
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @ApiResponseDataArray(QuestionSerializer)
  async findAll(): Promise<ResponseData<QuestionSerializer[]>> {
    const results = await this.questionService.findAll();
    return new ResponseData<QuestionSerializer[]>(
      results,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Get(':id')
  @ApiResponseData(QuestionSerializer)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<QuestionSerializer>> {
    const result = await this.questionService.findOneById(id);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Post()
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponseData(QuestionSerializer)
  async create(
    @Body() dto: CreateQuestionDto,
    @Req() req: any,
  ): Promise<ResponseData<QuestionSerializer>> {
    const result = await this.questionService.create(dto, req.user);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Put(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponseData(QuestionSerializer)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
  ): Promise<ResponseData<QuestionSerializer>> {
    const result = await this.questionService.update(id, dto);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Delete(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<{ message: string }>> {
    const result = await this.questionService.softDelete(id);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Get('stats/:subjectId')
  @ApiResponseData(QuestionStatsDto)
  async getStatsBySubject(
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ): Promise<ResponseData<QuestionStatsDto>> {
    const result = await this.questionService.getStatsBySubject(subjectId);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
