import {MigrationInterface, QueryRunner} from "typeorm";

export class apiRequestFailParam1661325556982 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."api_request_fail_param" (
          "id" serial4,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "channel" varchar not null,
          "product_code" varchar not null,
          "transporter" varchar not null,
          "client_reference" varchar ,
          "request_body" varchar not null,
          "transporter_request" varchar ,
          "cms_error" varchar,
          "transporter_error" varchar
        )
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE IF EXISTS "api_request_fail_param"`);
    }

}
