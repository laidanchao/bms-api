import {MigrationInterface, QueryRunner} from "typeorm";

export class delivengoWebhook1661396742460 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "public"."tracking_webhook_delivengo_log" (
          "id" serial4,
          "tracking_number" varchar(255) NOT NULL,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "request_body" varchar,
          "request_header" varchar
        )
      `);
      await queryRunner.query(`
        CREATE TABLE "public"."tracking_webhook_delivengo" (
          "id" serial4,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "tracking_number" varchar(255) NOT NULL,
          "localization_code" varchar(255),
          "localization_label" varchar(255),
          "event" varchar(255),
          "timestamp" timestamptz(6),
          "description" text,
          "request_body" varchar,
          PRIMARY KEY ("id")
        )
      `);
      await queryRunner.query(`
    CREATE UNIQUE INDEX "webhook_delivengo_trackingNumber_event_timestamp_key" ON ONLY public.tracking_webhook_delivengo USING btree (tracking_number, event, "timestamp")
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE IF EXISTS "tracking_webhook_delivengo_log"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "tracking_webhook_delivengo"`);
    }

}
