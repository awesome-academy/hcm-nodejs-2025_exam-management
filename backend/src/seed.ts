import { AppDataSource } from './data-source';
import { seedRoles } from './seeds/SeedRoles';

AppDataSource.initialize()
  .then(async () => {
    await seedRoles();
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  });
