import {MigrationInterface, QueryRunner} from "typeorm";

export class addCrawlerTargetManual1698647005752 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          CREATE TABLE "sct_crawler_target_manual" (
            "id" SERIAL NOT NULL,
            "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "tracking_number" VARCHAR(255) NOT NULL,
            "transporter" VARCHAR(255) NOT NULL,
            "transporter_site" VARCHAR(50),
            "transporter_account_id" VARCHAR(50),
            "file_path" VARCHAR(255) NOT NULL,
            "status" VARCHAR(50) NOT NULL,
            "fail_reason" VARCHAR(255)
          )
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
