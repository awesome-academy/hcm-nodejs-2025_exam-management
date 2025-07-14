// src/modules/roles/role.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';
import { BaseService } from '@/modules/shared/base.service';

@Injectable()
export class RoleService extends BaseService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    i18n: I18nService,
    context: RequestContextService,
  ) {
    super(i18n, context);
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepo.findOneBy({ name });

    if (!role) {
      throw new NotFoundException(await this.t('role.role_not_found'));
    }

    return role;
  }
}
