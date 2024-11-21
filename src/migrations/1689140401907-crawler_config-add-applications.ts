import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerConfigAddApplications1689140401907 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
    alter table "sct_crawler_config" add "application" varchar(100) NOT NULL DEFAULT '*';
    alter table "sct_crawler_config" add "operator" varchar(255)
`)
      await queryRunner.query(`ALTER TABLE "public"."sct_crawler_config"
  DROP COLUMN  "api_interface";`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
