import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1751273895754 implements MigrationInterface {
    name = 'InitDatabase1751273895754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`question_id\` int NOT NULL, \`answer_text\` text NOT NULL, \`is_correct\` tinyint NOT NULL DEFAULT 0, \`explanation\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`subject_id\` int NOT NULL, \`question_text\` text NOT NULL, \`question_type\` varchar(255) NOT NULL, \`parent_question_id\` int NULL, \`points\` int NOT NULL, \`difficulty_level\` varchar(255) NOT NULL, \`created_by\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`test_questions\` (\`test_id\` int NOT NULL, \`question_id\` int NOT NULL, \`order_number\` int NOT NULL, PRIMARY KEY (\`test_id\`, \`question_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`test_sessions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`test_id\` int NOT NULL, \`user_id\` int NOT NULL, \`started_at\` timestamp NOT NULL, \`submitted_at\` timestamp NULL, \`score\` int NULL, \`time_spent\` int NULL, \`status\` varchar(255) NOT NULL, \`is_completed\` tinyint NOT NULL DEFAULT 0, \`auto_graded\` tinyint NOT NULL DEFAULT 1, \`supervisor_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`tests\` (\`id\` int NOT NULL AUTO_INCREMENT, \`subject_id\` int NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`time_limit\` int NOT NULL, \`total_points\` int NOT NULL, \`passing_score\` int NOT NULL, \`is_published\` tinyint NOT NULL DEFAULT 0, \`created_by\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subjects\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`created_by\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_542cbba74dde3c82ab49c57310\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`email_verification_tokens\` (\`user_id\` int NOT NULL, \`token\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`full_name\` varchar(255) NOT NULL, \`avatar_url\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`email_verified_at\` timestamp NULL, \`remember_token\` varchar(255) NULL, \`role_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_answers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`session_id\` int NOT NULL, \`question_id\` int NOT NULL, \`answer_id\` int NULL, \`answer_text\` varchar(255) NULL, \`is_correct\` tinyint NOT NULL DEFAULT 0, \`points_earned\` int NULL, \`graded_by\` int NULL, \`graded_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`password_reset_tokens\` (\`email\` varchar(255) NOT NULL, \`token\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`email\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`answers\` ADD CONSTRAINT \`FK_677120094cf6d3f12df0b9dc5d3\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_bab312bafb550a655ece4bca116\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_16b3ce45fc164ea96c630065619\` FOREIGN KEY (\`parent_question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_7d0fdceddfeebcc65d61b2f4c70\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`test_questions\` ADD CONSTRAINT \`FK_5badfac5ec550e555213ad2e5bc\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`test_questions\` ADD CONSTRAINT \`FK_275f99133c07faa04deeda6e489\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`test_sessions\` ADD CONSTRAINT \`FK_dd7f8f85efafcb22fd970f74160\` FOREIGN KEY (\`test_id\`) REFERENCES \`tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`test_sessions\` ADD CONSTRAINT \`FK_91c0461040ab8006313df4f2ec0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD CONSTRAINT \`FK_bb708701ab45cf6120ebe279652\` FOREIGN KEY (\`subject_id\`) REFERENCES \`subjects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`tests\` ADD CONSTRAINT \`FK_f53be41d9195b72509c718efd6d\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`subjects\` ADD CONSTRAINT \`FK_c9006b576b282e18dba027d6a38\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` ADD CONSTRAINT \`FK_fdcb77f72f529bf65c95d72a147\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_b1dae489bd29735481f300ae311\` FOREIGN KEY (\`session_id\`) REFERENCES \`test_sessions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_adae59e684b873b084be36c5a7a\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_0e5dee6483b796c98b894c738f7\` FOREIGN KEY (\`answer_id\`) REFERENCES \`answers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_answers\` ADD CONSTRAINT \`FK_a0907203216ad0312811321b6e0\` FOREIGN KEY (\`graded_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_a0907203216ad0312811321b6e0\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_0e5dee6483b796c98b894c738f7\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_adae59e684b873b084be36c5a7a\``);
        await queryRunner.query(`ALTER TABLE \`user_answers\` DROP FOREIGN KEY \`FK_b1dae489bd29735481f300ae311\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`email_verification_tokens\` DROP FOREIGN KEY \`FK_fdcb77f72f529bf65c95d72a147\``);
        await queryRunner.query(`ALTER TABLE \`subjects\` DROP FOREIGN KEY \`FK_c9006b576b282e18dba027d6a38\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP FOREIGN KEY \`FK_f53be41d9195b72509c718efd6d\``);
        await queryRunner.query(`ALTER TABLE \`tests\` DROP FOREIGN KEY \`FK_bb708701ab45cf6120ebe279652\``);
        await queryRunner.query(`ALTER TABLE \`test_sessions\` DROP FOREIGN KEY \`FK_91c0461040ab8006313df4f2ec0\``);
        await queryRunner.query(`ALTER TABLE \`test_sessions\` DROP FOREIGN KEY \`FK_dd7f8f85efafcb22fd970f74160\``);
        await queryRunner.query(`ALTER TABLE \`test_questions\` DROP FOREIGN KEY \`FK_275f99133c07faa04deeda6e489\``);
        await queryRunner.query(`ALTER TABLE \`test_questions\` DROP FOREIGN KEY \`FK_5badfac5ec550e555213ad2e5bc\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_7d0fdceddfeebcc65d61b2f4c70\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_16b3ce45fc164ea96c630065619\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_bab312bafb550a655ece4bca116\``);
        await queryRunner.query(`ALTER TABLE \`answers\` DROP FOREIGN KEY \`FK_677120094cf6d3f12df0b9dc5d3\``);
        await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
        await queryRunner.query(`DROP TABLE \`user_answers\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`email_verification_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_542cbba74dde3c82ab49c57310\` ON \`subjects\``);
        await queryRunner.query(`DROP TABLE \`subjects\``);
        await queryRunner.query(`DROP TABLE \`tests\``);
        await queryRunner.query(`DROP TABLE \`test_sessions\``);
        await queryRunner.query(`DROP TABLE \`test_questions\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP TABLE \`answers\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }

}
