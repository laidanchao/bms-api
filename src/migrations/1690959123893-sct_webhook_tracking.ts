import {MigrationInterface, QueryRunner} from "typeorm";

export class sctWebhookTracking1690959123893 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."sct_webhook_tracking" (
          "id" serial4,
          "created_at" timestamptz NOT NULL DEFAULT now(),
          "updated_at" timestamptz NOT NULL DEFAULT now(),
          "tracking_number" varchar(255) not null,
          "reference" varchar(255),
          "event" varchar(800) not null,
          "timestamp" timestamptz not null,
          "description" text,
          "location" varchar(255),
          "platform" varchar(255) not null,
          "transporter_account" varchar(255)
          )
      `)
      await queryRunner.query(`CREATE UNIQUE INDEX "UK_TRACKING_EVENT_TIMESTAMP" ON "public"."sct_webhook_tracking" USING btree (
  "tracking_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "event" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "timestamp"
);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
