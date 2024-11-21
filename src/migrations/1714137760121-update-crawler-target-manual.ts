import {MigrationInterface, QueryRunner} from "typeorm";

export class updateCrawlerTargetManual1714137760121 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table sct_crawler_target_manual
         add column if not exists shipping_number varchar(50),
         add column if not exists receiver_postal_code varchar(50),
         add column if not exists sort int default 100
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
