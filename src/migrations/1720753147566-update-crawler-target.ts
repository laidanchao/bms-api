import {MigrationInterface, QueryRunner} from "typeorm";

export class updateCrawlerTarget1720753147566 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table sct_crawler_target
          add column last_crawl_time TIMESTAMP(6) WITH TIME ZONE
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
