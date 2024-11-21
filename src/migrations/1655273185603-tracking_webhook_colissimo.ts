import { MigrationInterface, QueryRunner } from 'typeorm';

export class trackingWebhook1655273185603 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "public"."tracking_webhook_colissimo" (
          "id" serial4,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "tracking_number" varchar(255) NOT NULL,
          "reference" varchar(255),
          "event" varchar(255),
          "timestamp" timestamptz(6),
          "description" text,
          "request_body" varchar,
          PRIMARY KEY ("id")
        )
      `);
    await queryRunner.query(`
    CREATE UNIQUE INDEX "tracking_trackingNumber_event_timestamp_key" ON ONLY public.tracking_webhook_colissimo USING btree (tracking_number, event, "timestamp")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tracking_webhook_colissimo"`);
  }

}
