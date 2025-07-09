import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@/common/decorators/role.decorator';
import { UserRole } from '@/common/enums/role.enum';
import { ResponseData } from '@/common/classes/response.class';
import { AnswerSerializer } from './serializers/answer.serializer';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { CreateBulkAnswerDto } from './dto/create-bulk-answer.dto';
import { ApiTags, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { MessageResponseDto } from '@/common/dto/message-response.dto';

@ApiTags('Answer')
@ApiExtraModels(AnswerSerializer, MessageResponseDto)
@Controller('answers')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Put(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: UpdateAnswerDto })
  @ApiResponseData(AnswerSerializer)
  async update(
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

  @Post('bulk/:questionId')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: CreateBulkAnswerDto })
  @ApiResponseDataArray(AnswerSerializer)
  async createBulk(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() body: CreateBulkAnswerDto,
  ): Promise<ResponseData<AnswerSerializer[]>> {
    const data = await this.answerService.createMany(questionId, body.answers);
    return new ResponseData<AnswerSerializer[]>(
      data,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Delete('question/:questionId')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async deleteByQuestionId(
    @Param('questionId', ParseIntPipe) questionId: number,
  ): Promise<ResponseData<MessageResponseDto>> {
    const data = await this.answerService.deleteByQuestionId(questionId);
    return new ResponseData(data, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
