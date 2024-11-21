import { MigrationInterface, QueryRunner } from 'typeorm';

export class purchaseDetailEdit1661505253344 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "public"."bill_purchase_detail"
        ADD COLUMN "product" varchar(20),
        ADD COLUMN "receive_country_code" char(2)
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."bill_purchase_detail"
      DROP COLUMN "product",
      DROP COLUMN "receive_country_code"
    `);
  }

}
