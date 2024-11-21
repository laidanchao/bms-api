import {MigrationInterface, QueryRunner} from "typeorm";

export class uxIndemnity1672988794363 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "public"."clm_monthly_indemnity" ADD COLUMN "compensation_month" varchar(50)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
