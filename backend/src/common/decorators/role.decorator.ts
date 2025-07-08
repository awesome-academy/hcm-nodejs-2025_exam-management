import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const Role = (role: UserRole) => SetMetadata('role', role);
