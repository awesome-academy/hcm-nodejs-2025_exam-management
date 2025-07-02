import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private getLang(): string {
    return this.context.getLang() || 'vi';
  }

  async findByName(name: string): Promise<Role> {
    const lang = this.getLang();

    const role = await this.roleRepo.findOneBy({ name });
    if (!role) {
      throw new NotFoundException(
        await this.i18n.translate('role.role_not_found', {
          args: { name },
          lang,
        }),
      );
    }
    return role;
  }
}
