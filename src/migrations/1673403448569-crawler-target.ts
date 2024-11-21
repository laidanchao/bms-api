import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerTarget1673403448569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "sct_crawler_target" ADD if not exists "max_count" integer NOT NULL DEFAULT '0';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
