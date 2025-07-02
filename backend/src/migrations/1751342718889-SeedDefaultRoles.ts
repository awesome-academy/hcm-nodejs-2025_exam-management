import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultRoles1751342718889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, name, description) VALUES
        (1, 'suppervisor', 'Người giám sát'),
        (2, 'user', 'Học viên')
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        description = VALUES(description);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE id IN (1, 2);
    `);
  }
}
