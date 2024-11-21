import {MigrationInterface, QueryRunner} from "typeorm";

export class updateCrawlerPlanAndTarget1702445733284 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_crawler_config" RENAME COLUMN "officially" TO "official";
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
