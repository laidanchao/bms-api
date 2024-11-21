import {MigrationInterface, QueryRunner} from "typeorm";

export class addIndemnityBill1712909240831 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "scb_indemnity_bill" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "invoice_id" int4 not null,
          "year_month" char(7) not null,
          "transporter" varchar(50) not null,
          "application" varchar(50) not null,
          "amount" numeric(10,2) not null,
          "parcel_quantity" int4 not null
        )
      `);

      await queryRunner.query(`
        CREATE TABLE if not exists "scb_indemnity_bill_detail" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "bill_id" int4 not null,
          "tracking_number" varchar(50) not null,
          "client_id" varchar(50),
          "amount" numeric(10,2) not null
        )
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
