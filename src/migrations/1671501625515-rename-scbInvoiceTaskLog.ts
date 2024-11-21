import {MigrationInterface, QueryRunner} from "typeorm";

export class renameScbInvoiceTaskLog1671501625515 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists bill_parse_record rename to scb_invoice_task_log;
        alter table if exists clm_invoice rename to scb_invoice;

      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
