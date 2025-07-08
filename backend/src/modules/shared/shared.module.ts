import { Module } from '@nestjs/common';
import { RequestContextService } from './request-context.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  providers: [RequestContextService, CloudinaryService],
  exports: [RequestContextService, CloudinaryService],
})
export class SharedModule {}
