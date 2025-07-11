import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteParentQuestionAndTotalPoints1752138181761 implements MigrationInterface {
    name = 'DeleteParentQuestionAndTotalPoints1752138181761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_16b3ce45fc164ea96c630065619\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`parent_question_id\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP COLUMN \`total_points\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tests\` ADD \`total_points\` int NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`parent_question_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_16b3ce45fc164ea96c630065619\` FOREIGN KEY (\`parent_question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
