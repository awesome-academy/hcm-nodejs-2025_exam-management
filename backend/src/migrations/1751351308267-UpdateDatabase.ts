import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDatabase1751351308267 implements MigrationInterface {
    name = 'UpdateDatabase1751351308267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_a0907203216ad0312811321b6e0\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_7d0fdceddfeebcc65d61b2f4c70\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP FOREIGN KEY \`FK_f53be41d9195b72509c718efd6d\``);
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP FOREIGN KEY \`FK_c9006b576b282e18dba027d6a38\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` CHANGE \`graded_by\` \`grader_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`created_by\` \`creator_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`created_by\` \`creator_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`subjects\` CHANGE \`created_by\` \`creator_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_7440ccd5e5f73dc3e54cde9e6a1\` FOREIGN KEY (\`grader_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_639aedf3c20845210592b370893\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD CONSTRAINT \`FK_289e996f33cd4b6c073a241c423\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD CONSTRAINT \`FK_8ab083a78a55862a4bb7c20275d\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP FOREIGN KEY \`FK_8ab083a78a55862a4bb7c20275d\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP FOREIGN KEY \`FK_289e996f33cd4b6c073a241c423\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_639aedf3c20845210592b370893\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_7440ccd5e5f73dc3e54cde9e6a1\``);
        await queryRunner.query(`ALTER TABLE \`subjects\` CHANGE \`creator_id\` \`created_by\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`tests\` CHANGE \`creator_id\` \`created_by\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`questions\` CHANGE \`creator_id\` \`created_by\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` CHANGE \`grader_id\` \`graded_by\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD CONSTRAINT \`FK_c9006b576b282e18dba027d6a38\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD CONSTRAINT \`FK_f53be41d9195b72509c718efd6d\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_7d0fdceddfeebcc65d61b2f4c70\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_a0907203216ad0312811321b6e0\` FOREIGN KEY (\`graded_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
