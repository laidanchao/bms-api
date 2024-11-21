import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerPlanAddEndAt1715070553824 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table sct_crawler_plan
          add column if not exists end_at timestamptz
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
