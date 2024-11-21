import {MigrationInterface, QueryRunner} from "typeorm";

export class udpateParcelPush1705284190794 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."npm_parcel_push"
          DROP COLUMN "client_id",
          DROP COLUMN "deletedAt",
          DROP COLUMN "handler_func",
          DROP COLUMN "response_handler",
          DROP COLUMN "process_type",
          DROP COLUMN "push_type",
          DROP COLUMN "header"
          DROP COLUMN "url";
      `)

      await queryRunner.query(`
        ALTER TABLE "public"."npm_parcel_push"
          ADD COLUMN "operator" varchar(50);
      `)

      await queryRunner.query(`
        ALTER TABLE "public"."npm_parcel_push" RENAME COLUMN "application_id" TO "application";
      `)

      await queryRunner.query(`
        CREATE UNIQUE INDEX "UK_IDX_NPM_PARCEL_PUSH_APPLICATION" ON "public"."npm_parcel_push" ("application")
      `)

      await queryRunner.query(`
        update npm_parcel_push set topic='CMS_ESENDEO_PARCEL', where application='ESENDEO';
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
