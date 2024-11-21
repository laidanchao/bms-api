import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTrackingPush1694583802460 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."npm_tracking_push"
          ADD COLUMN "include_external_account" bool;
      `)

      await queryRunner.query(`
        update npm_tracking_push set include_external_account='f';
      `)

      await queryRunner.query(`
        ALTER TABLE "public"."npm_tracking_push"
          ALTER COLUMN "include_external_account" SET NOT NULL;
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
