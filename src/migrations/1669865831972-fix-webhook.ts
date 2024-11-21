import {MigrationInterface, QueryRunner} from "typeorm";

export class fixWebhook1669865831972 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.query(`
        alter table "tracking_webhook_log" rename to "sct_webhook_record";
      `);

      await queryRunner.query(`
        ALTER TABLE "public"."sct_webhook_record"
        ALTER COLUMN "request_body" SET NOT NULL,
        ALTER COLUMN "tracking_number" SET NOT NULL,
        ALTER COLUMN "platform" SET NOT NULL;
      `)

      await queryRunner.query(`
        drop table tracking_webhook_colissimo;
        drop table tracking_webhook_colissimo_log;
        drop table tracking_webhook_delivengo;
      `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
