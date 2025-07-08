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
  Req,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectSerializer } from './serializers/subject.serializer';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { ApiTags, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@/common/enums/role.enum';
import { Role } from '@/common/decorators/role.decorator';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { MessageResponseDto } from '@/common/dto/message-response.dto';

@ApiTags('Subject')
@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiExtraModels(SubjectSerializer, MessageResponseDto)
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @ApiResponseDataArray(SubjectSerializer)
  async findAll(): Promise<ResponseData<SubjectSerializer[]>> {
    const results = await this.subjectService.findAll();
    return new ResponseData<SubjectSerializer[]>(
      results,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Get(':id')
  @ApiResponseData(SubjectSerializer)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<SubjectSerializer>> {
    const subject = await this.subjectService.findOneById(id);
    return new ResponseData(subject, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Post()
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponseData(SubjectSerializer)
  async create(
    @Body() dto: CreateSubjectDto,
    @Req() req: any,
  ): Promise<ResponseData<SubjectSerializer>> {
    const subject = await this.subjectService.create(dto, req.user);
    return new ResponseData(subject, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Put(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponseData(SubjectSerializer)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ): Promise<ResponseData<SubjectSerializer>> {
    const subject = await this.subjectService.update(id, dto);
    return new ResponseData(subject, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Delete(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<{ message: string }>> {
    const result = await this.subjectService.softDelete(id);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
