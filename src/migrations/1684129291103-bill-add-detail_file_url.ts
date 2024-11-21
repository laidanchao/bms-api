import {MigrationInterface, QueryRunner} from "typeorm";

export class billAddDetailFileUrl1684129291103 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      alter table scb_bill rename column parquet_url to detail_file_url;
      ALTER TABLE "public"."scb_bill" ALTER COLUMN "detail_file_url" TYPE varchar(1000) COLLATE "pg_catalog"."default";
      alter table scb_bill add column file_for_application varchar(1000);
      alter table clm_invoice  ADD COLUMN "is_pushed" bool default 'f';
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
