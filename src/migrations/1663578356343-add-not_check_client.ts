import {MigrationInterface, QueryRunner} from "typeorm";

export class addNotCheckClient1663578356343 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."api_not_check_client" (
          "id" serial4,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "deleted_at" timestamptz(6),
          "operator" varchar,
          "enable" boolean,
          "application" varchar,
          "client" varchar
          )
      `);
      await queryRunner.query(`
    CREATE UNIQUE INDEX "api_not_check_client_application_enable_key" ON ONLY public.api_not_check_client USING btree (application, client, "enable")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE IF EXISTS "api_not_check_client"`);
    }

}
