import {MigrationInterface, QueryRunner} from "typeorm";

export class ccInvoice1683352019016 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists cpv_invoice rename to scb_invoice;
        update scb_invoice set bill_type = 'CP_INDEMNITY' where bill_type = 'INDEMNITY';
        ALTER TABLE "public"."scb_bill_detail" ADD COLUMN "pickup_fee" numeric(10,2);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
