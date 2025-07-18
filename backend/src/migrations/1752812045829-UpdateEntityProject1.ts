import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntityProject11752812045829 implements MigrationInterface {
    name = 'UpdateEntityProject11752812045829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`test_questions\``);
        await queryRunner.query(`CREATE TABLE \`test_session_questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`session_id\` int NOT NULL, \`question_id\` int NOT NULL, \`answers_snapshot\` json NULL, \`order_number\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`answer_is_correct_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`answer_text_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`question_answers_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP COLUMN \`question_text_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`version\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`version\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`is_latest\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`question_count\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`easy_question_count\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`medium_question_count\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`hard_question_count\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`test_session_questions\` ADD CONSTRAINT \`FK_442f1d2b59a9643498e3101129b\` FOREIGN KEY (\`session_id\`) REFERENCES \`test_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`test_session_questions\` ADD CONSTRAINT \`FK_e964cda68a869fc13adf1060b72\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`test_session_questions\` DROP FOREIGN KEY \`FK_e964cda68a869fc13adf1060b72\``);
        await queryRunner.query(`ALTER TABLE \`test_session_questions\` DROP FOREIGN KEY \`FK_442f1d2b59a9643498e3101129b\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`hard_question_count\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`medium_question_count\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`easy_question_count\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`question_count\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`is_latest\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`version\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`question_text_snapshot\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`question_answers_snapshot\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`answer_text_snapshot\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD \`answer_is_correct_snapshot\` tinyint NULL`);
        await queryRunner.query(`DROP TABLE \`test_session_questions\``);
    }
}
