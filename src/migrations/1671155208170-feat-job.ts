import {MigrationInterface, QueryRunner} from "typeorm";

export class featJob1671155208170 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('drop table if exists job_task_index;');
      await queryRunner.query('alter table if exists channel_transporter_product rename to sci_transporter_product;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
