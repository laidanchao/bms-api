import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteBillTaskId1681196577359 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."scb_bill"
          DROP COLUMN "task_id";
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
