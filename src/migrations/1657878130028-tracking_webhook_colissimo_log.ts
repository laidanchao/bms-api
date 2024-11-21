import { MigrationInterface, QueryRunner } from 'typeorm';

export class trackingWebhookColissimoLog1657878130028 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "public"."tracking_webhook_colissimo_log" (
          "id" serial4,
          "created_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
          "request_body" varchar,
          "request_header" varchar

        )
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tracking_webhook_colissimo_log"`);
  }

}
