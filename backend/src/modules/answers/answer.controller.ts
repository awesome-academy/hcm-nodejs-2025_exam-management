import {
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@/common/decorators/role.decorator';
import { UserRole } from '@/common/enums/role.enum';
import { ResponseData } from '@/common/classes/response.class';
import { AnswerSerializer } from './serializers/answer.serializer';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ApiTags, ApiExtraModels } from '@nestjs/swagger';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { MessageResponseDto } from '@/common/dto/message-response.dto';

@Controller('answers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Answer')
@ApiExtraModels(AnswerSerializer, MessageResponseDto)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get('question/:questionId')
  @ApiResponseDataArray(AnswerSerializer)
  async getAnswersByQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
  ): Promise<ResponseData<AnswerSerializer[]>> {
    const data = await this.answerService.findByQuestion(questionId);
    return new ResponseData<AnswerSerializer[]>(
      data,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Post('question/:questionId/answers')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(AnswerSerializer)
  async createAnswer(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: CreateAnswerDto,
  ): Promise<ResponseData<AnswerSerializer>> {
    const data = await this.answerService.create(questionId, dto);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Put(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(AnswerSerializer)
  async updateAnswer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnswerDto,
  ): Promise<ResponseData<AnswerSerializer>> {
    const data = await this.answerService.update(id, dto);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Delete(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<MessageResponseDto>> {
    const data = await this.answerService.delete(id);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
