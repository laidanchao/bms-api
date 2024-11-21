import {MigrationInterface, QueryRunner} from "typeorm";

export class trackingTarget1623037343871 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."tracking_target" (
          "id" serial4,
          "trackingNumber" varchar COLLATE "pg_catalog"."default",
          "timestamp" timestamptz(6),
          "status" varchar(255) COLLATE "pg_catalog"."default" DEFAULT 'CREATED'::character varying,
          "count" int4 DEFAULT 0,
          "active" bool DEFAULT true,
          "filePath" varchar(255) COLLATE "pg_catalog"."default",
          PRIMARY KEY ("id")
        );
      `);
      await queryRunner.query(`
        CREATE UNIQUE INDEX "INDEX_TRACKINGNUMBER" ON "public"."tracking_target" USING btree (
          "trackingNumber"
        );
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP INDEX "INDEX_TRACKINGNUMBER"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "tracking_target"`);
    }

}
