import {MigrationInterface, QueryRunner} from "typeorm";

export class featSci1670492215942 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists channel_transporter rename to sci_transporter;
        alter table if exists api_transporter_method rename to sci_transporter_method;
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
