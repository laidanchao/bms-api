import {MigrationInterface, QueryRunner} from "typeorm";

export class extraFeeDetail1624958132000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "public"."bill_extra_fee_detail" (
        "id" serial4,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "extraFeeId" int4,
        "billId" int4,
        "name" varchar(255),
        "clientId" varchar,
        "transporterAccountId" varchar,
        "quantity" numeric(255),
        "amount" numeric(255,3),
        PRIMARY KEY ("id"),
        CONSTRAINT "UK_billId_name_clientId_transporterAccountId" UNIQUE ("billId", "name", "clientId", "transporterAccountId")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bill_extra_fee_detail"`);
  }

}
