import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewPasswordColumn1673346148130 implements MigrationInterface {
    name = 'AddNewPasswordColumn1673346148130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`password\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`password\``);
    }

}
