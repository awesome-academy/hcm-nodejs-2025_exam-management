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
  Query,
} from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { TestSerializer } from './serializers/test.serializer';
import { ResponseData } from '@/common/classes/response.class';
import { HttpStatus, HttpMessage } from '@/common/enums/global.enum';
import { ApiTags, ApiExtraModels, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@/common/decorators/role.decorator';
import { UserRole } from '@/common/enums/role.enum';
import {
  ApiResponseData,
  ApiResponseDataArray,
} from '@/common/decorators/api-response.decorator';
import { UseGuards } from '@nestjs/common';
import { MessageResponseDto } from '@/common/dto/message-response.dto';

@ApiTags('Test')
@ApiExtraModels(TestSerializer, MessageResponseDto)
@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @ApiResponseDataArray(TestSerializer)
  async findAll(
    @Query('subject_id') subject_id?: string,
    @Query('is_published') is_published?: string,
  ): Promise<ResponseData<TestSerializer[]>> {
    const results = await this.testService.findAll({
      subject_id,
      is_published,
    });
    return new ResponseData<TestSerializer[]>(
      results,
      HttpStatus.SUCCESS,
      HttpMessage.SUCCESS,
    );
  }

  @Get(':id')
  @ApiResponseData(TestSerializer)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<TestSerializer>> {
    const result = await this.testService.findOneById(id);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Post()
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: CreateTestDto })
  @ApiResponseData(TestSerializer)
  async create(
    @Body() dto: CreateTestDto,
    @Req() req: any,
  ): Promise<ResponseData<TestSerializer>> {
    const result = await this.testService.create(dto, req.user);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Put(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiBody({ type: UpdateTestDto })
  @ApiResponseData(TestSerializer)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestDto,
  ): Promise<ResponseData<TestSerializer>> {
    const result = await this.testService.update(id, dto);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }

  @Delete(':id')
  @Role(UserRole.SUPPERVISOR)
  @ApiResponseData(MessageResponseDto)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData<{ message: string }>> {
    const result = await this.testService.softDelete(id);
    return new ResponseData(result, HttpStatus.SUCCESS, HttpMessage.SUCCESS);
  }
}
