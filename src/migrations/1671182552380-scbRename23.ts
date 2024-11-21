import {MigrationInterface, QueryRunner} from "typeorm";

export class scbRename231671182552380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists bill_task rename to scb_invoice_task;
        alter table if exists bill_task_template rename to scb_invoice_plan;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
