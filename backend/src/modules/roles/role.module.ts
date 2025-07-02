import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';
import { SharedModule } from '@/modules/shared/shared.module';
@Module({
  imports: [TypeOrmModule.forFeature([Role]), SharedModule],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
