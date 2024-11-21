import {MigrationInterface, QueryRunner} from "typeorm";

export class renameDictionary1729566909372 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists sys_dictionary rename to ssm_system_variable
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
