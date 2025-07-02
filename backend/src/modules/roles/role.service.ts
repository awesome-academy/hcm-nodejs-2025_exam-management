import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
@Injectable()
export class RoleService {
  constructor(@InjectRepository(Role) private roleRepo: Repository<Role>) {}

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepo.findOneBy({ name });
    if (!role) {
      throw new NotFoundException(`Role '${name}' not found`);
    }
    return role;
  }
}

