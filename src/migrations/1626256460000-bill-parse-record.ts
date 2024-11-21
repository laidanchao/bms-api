import { MigrationInterface, QueryRunner } from 'typeorm';

export class billParseRecord1626256460000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        CREATE TABLE "public"."bill_parse_record" (
          "id" serial4,
          "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
          "billTaskId" int4 NOT NULL,
          "sourceFileUrl" varchar(255) NOT NULL,
          "purchaseDetailUrl" varchar(255),
          "purchaseBillUrl" varchar(255),
          "indemnityUrl" varchar(255),
          "weightUrl" varbit(255),
          PRIMARY KEY ("id")
        );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "bill_parse_record"`);
  }

}
