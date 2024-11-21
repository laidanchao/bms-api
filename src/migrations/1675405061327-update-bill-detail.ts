import {MigrationInterface, QueryRunner} from "typeorm";

export class updateBillDetail1675405061327 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."scb_bill_detail"
          ADD COLUMN "extra_fee_detail_minus" json,
          ADD COLUMN "extra_fee_minus" numeric(10,2);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
