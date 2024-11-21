import {MigrationInterface, QueryRunner} from "typeorm";

export class renameTrackingPlan1669795863519 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      // 删除表
      await queryRunner.dropTable('message',true);
      await queryRunner.dropTable('tracking_parcel_relation',true);
      await queryRunner.dropTable('tracking_craw_parcel_task_scheduler',true);
      await queryRunner.dropTable('tracking_fetch_record',true);

      // 重命名表
      await queryRunner.query(`
        alter table "tracking_plan" rename to "sct_crawler_plan";
        alter table "tracking_target" rename to "sct_crawler_target";
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    }

}
