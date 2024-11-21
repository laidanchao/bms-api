import { MigrationInterface, QueryRunner } from 'typeorm';

export class billDetailColumn1630909830000 implements MigrationInterface{
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "public"."bill_purchase_detail" ADD COLUMN "weightType" varchar;`);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "public"."bill_purchase_detail" DROP COLUMN "weightType";`);
  }

}
