import {MigrationInterface, QueryRunner} from "typeorm";

export class internalMonitorAddNote1698128061150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "public"."sct_internal_monitor" ADD COLUMN "note" varchar`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
