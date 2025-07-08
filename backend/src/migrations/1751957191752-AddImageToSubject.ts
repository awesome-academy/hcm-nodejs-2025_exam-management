import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageToSubject1751957191752 implements MigrationInterface {
    name = 'AddImageToSubject1751957191752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD \`image_url\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP COLUMN \`image_url\``);
    }

}
