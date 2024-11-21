import {MigrationInterface, QueryRunner} from "typeorm";

export class cpvInvoice1678932188964 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table if exists scb_invoice_task rename to cpv_invoice`)
      await queryRunner.query(`alter table if exists  scb_invoice_task_log rename to scb_invoice_log`)
      await queryRunner.query(`
      ALTER TABLE "cpv_invoice"
      ADD COLUMN "is_pushed" bool default 'f',
      ADD COLUMN "operator"  varchar(50),
      ADD COLUMN "channel_account"  varchar(50);
      ;
`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
