import {MigrationInterface, QueryRunner} from "typeorm";

export class trackingSchedule1621650444183 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."tracking_plan" (
          "id" serial4,
          "createdAt" timestamptz,
          "updatedAt" timestamptz,
          "transporter" varchar(255),
          "filePath" varchar(255),
          "schedule" timestamptz NOT NULL,
          "status" varchar(255) NOT NULL DEFAULT 'READY'::character varying,
          "result" varchar(255),
          PRIMARY KEY ("id"));
      `);
      await queryRunner.query(`
        CREATE INDEX "index_schedule" ON "public"."tracking_plan" USING btree (
          "schedule"
        );
      `);
      await queryRunner.query(`
        ALTER TABLE "public"."tracking_plan"
          ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
          ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP INDEX "index_schedule"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "tracking_plan"`);
    }

}
