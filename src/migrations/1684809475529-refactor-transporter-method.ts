import { MigrationInterface, QueryRunner } from 'typeorm';

export class refactorTransporterMethod1684809475529 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table if exists sci_transporter_method;
    `);

    await queryRunner.query(`
      CREATE SEQUENCE if not exists "transporter_methods_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    `);

    await queryRunner.query(`
       CREATE TABLE if not exists "public"."sci_transporter_method" (
        "id" int4 NOT NULL DEFAULT nextval('transporter_methods_id_seq'::regclass),
        "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "transporter" varchar(50) NOT NULL,
        "interface_doc" varchar(255),
        "can_order" bool NOT NULL default 'f',
        "can_cancel_order" bool NOT NULL default 'f',
        "can_get_official_tracking" bool NOT NULL default 'f',
        "can_get_unofficial_tracking" bool NOT NULL default 'f',
        "can_order_pickup" bool NOT NULL default 'f',
        "can_cancel_order_pickup" bool NOT NULL default 'f',
        "can_upload_etd" bool NOT NULL default 'f',
        "other_service" varchar(255) NOT NULL default '',
        CONSTRAINT "PK_3116c7bb49df9ab181b593a90eb" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX if not exists "index_transporter" ON "public"."sci_transporter_method" (
        "transporter"
      );
    `);

    await queryRunner.query(`
      INSERT into sci_transporter_method (transporter) select id  from sci_transporter;
    `);

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
