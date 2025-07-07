import { AppDataSource } from '../data-source';
import { Role } from '@/modules/roles/entities/role.entity';

export async function seedRoles() {
  const roleRepo = AppDataSource.getRepository(Role);

  const roles = [
    { id: 1, name: 'suppervisor', description: 'Người giám sát' },
    { id: 2, name: 'user', description: 'Học viên' },
  ];

  for (const role of roles) {
    const exists = await roleRepo.findOneBy({ id: role.id });
    if (!exists) {
      await roleRepo.save(role);
    }
  }

  console.log('Seeded default roles.');
}
