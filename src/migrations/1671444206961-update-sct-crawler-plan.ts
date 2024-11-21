import {MigrationInterface, QueryRunner} from "typeorm";

export class updateSctCrawlerPlan1671444206961 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_crawler_plan"
          ADD COLUMN "elapsed_time" int8;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
