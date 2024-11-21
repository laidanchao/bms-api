import {MigrationInterface, QueryRunner} from "typeorm";

export class uxSurchargeRefund1673489527998 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "public"."clm_surcharge_refund" ADD COLUMN "actual_refund_details" varchar(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
