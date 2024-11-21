import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerPlan1676874119907 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table sct_crawler_config alter column crawler_cron drop not null`);
      await queryRunner.query(`alter table sct_crawler_config add if not exists multiple_points json default '[]'`);
      await queryRunner.query(`alter table sct_crawler_plan add if not exists comment varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
