import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpiresAtToEmailVerificationTokens1751430515066 implements MigrationInterface {
    name = 'AddExpiresAtToEmailVerificationTokens1751430515066'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD \`expires_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP COLUMN \`expires_at\``);
    }
}
