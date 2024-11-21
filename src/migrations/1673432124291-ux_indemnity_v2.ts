import {MigrationInterface, QueryRunner} from "typeorm";

export class uxIndemnityV21673432124291 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "public"."clm_monthly_indemnity" ADD COLUMN "promise_refund_month" varchar(50)`)
      await queryRunner.query(`ALTER TABLE "public"."clm_monthly_indemnity" ADD COLUMN "shipping_fee_difference" numeric(10,2)`)
      await queryRunner.query(`ALTER TABLE "public"."clm_monthly_indemnity" ADD COLUMN "actual_indemnity" numeric(10,2)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
