import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeleteDateColumn1751943644794 implements MigrationInterface {
    name = 'AddDeleteDateColumn1751943644794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` CHANGE \`expires_at\` \`expires_at\` datetime NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` CHANGE \`expires_at\` \`expires_at\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`deleted_at\``);
    }

}
