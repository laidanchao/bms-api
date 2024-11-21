import {MigrationInterface, QueryRunner} from "typeorm";

export class scbInvoiceTaskDelete1671602871812 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      ALTER TABLE "scb_invoice_task" drop column "sub_account";
      ALTER TABLE "scb_invoice_plan" drop column "sub_account";
      ALTER TABLE "scb_invoice_plan" drop column "check_list";
      ALTER TABLE if exists bill_purchase_bill rename to scb_bill;
      ALTER TABLE if exists bill_purchase_detail rename to scb_bill_detail;
      ALTER TABLE if exists bill_fuel_rate rename to scb_fuel_rate;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
