import {MigrationInterface, QueryRunner} from "typeorm";

export class modifyCrawlerPlan1673849889532 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('alter table sct_crawler_plan add if not exists automatic boolean default true;');
      await queryRunner.query('comment on COLUMN sct_crawler_plan.automatic is \'是否自动创建\';');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
