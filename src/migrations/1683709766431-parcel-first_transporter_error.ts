import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelFirstTransporterError1683709766431 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
       alter table "api_request_param" add column "first_transporter_error" varchar(255);
       alter table "api_request_fail_param" add column "first_transporter_error" varchar(255);
       `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
