import {MigrationInterface, QueryRunner} from "typeorm";

export class addScbInvoice1677568352543 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table "scb_invoice" rename to "clm_invoice"`)
      await queryRunner.query(`
            alter table "clm_invoice"
            add column "surcharge_is_confirmed" boolean default 'f',
            add column "status" varchar(50),
            add column "result" json;
            `)
      await queryRunner.query(`
            alter table "scb_bill"
            add column "invoice_id" int
            `)
      await queryRunner.query(`
            alter table "scb_invoice_task_log"
            add column "invoice_id" int,
            alter column "bill_task_id" DROP NOT NULL
            `)
      await queryRunner.query(`
               alter table "bill_indemnity_fee_detail"
            add column "invoice_id" int
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
