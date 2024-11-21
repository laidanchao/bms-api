import {MigrationInterface, QueryRunner} from "typeorm";

export class sct17trackAccount1688708003838 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          CREATE TABLE "sct_17track_account" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "account" varchar(255) not null,
          "password" varchar(255) not null,
          "key" varchar(255) not null,
          "application" varchar(100) not null)
      `);
      await queryRunner.query(`
          ALTER TABLE "public"."sct_17track_account" ADD CONSTRAINT "uk_application" UNIQUE ("application");
          COMMENT ON CONSTRAINT "uk_application" ON "public"."sct_17track_account" IS '一个平台只能有一个17track账号';`)

      await queryRunner.query(`
          ALTER TABLE "public"."sct_17track"
          DROP COLUMN "password",
          DROP COLUMN "key";`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
