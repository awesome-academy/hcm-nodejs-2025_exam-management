import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSnapshotToUserAnswer1752465251844 implements MigrationInterface {
    name = 'UpdateSnapshotToUserAnswer1752465251844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`question_answers_snapshot\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`question_answers_snapshot\``);
    }

}
