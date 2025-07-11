import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToQuestionAndAnswer1752218445579 implements MigrationInterface {
    name = 'AddIsActiveToQuestionAndAnswer1752218445579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`answers\` ADD \`is_active\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`is_active\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`is_active\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP COLUMN \`is_active\``);
    }

}
