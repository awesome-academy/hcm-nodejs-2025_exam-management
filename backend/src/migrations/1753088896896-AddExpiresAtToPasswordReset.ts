import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpiresAtToPasswordReset1753088896896 implements MigrationInterface {
    name = 'AddExpiresAtToPasswordReset1753088896896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` ADD \`expires_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` DROP COLUMN \`expires_at\``);
    }

}
