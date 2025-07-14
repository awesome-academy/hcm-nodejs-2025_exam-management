import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSnapshotToUserAnswer1752464103118 implements MigrationInterface {
    name = 'AddSnapshotToUserAnswer1752464103118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`question_text_snapshot\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`answer_text_snapshot\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`answer_is_correct_snapshot\` tinyint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`answer_is_correct_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`answer_text_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`question_text_snapshot\``);
    }

}
