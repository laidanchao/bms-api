import {MigrationInterface, QueryRunner} from "typeorm";

export class featSci1670983275599 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists api_zipcode rename to sci_cp_zone;
        alter table if exists api_city_postal_code rename to sci_6a_zone;
        alter table if exists api_colissimo_hub rename to sci_6g_zone;
      `);
      await queryRunner.query('drop table if exists api_city_rule_config;');
      await queryRunner.query('drop table if exists operation_log;');
      await queryRunner.query('drop table if exists colisprive_event;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
