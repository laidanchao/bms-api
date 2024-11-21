import {MigrationInterface, QueryRunner} from "typeorm";

export class updateCrawlerTarget1700718319887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "sct_crawler_target" ADD COLUMN "receiver_postal_code" varchar(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
