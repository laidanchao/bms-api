import {MigrationInterface, QueryRunner} from "typeorm";

export class updateEventPushRequest1679547896066 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."npm_event_push_request"
        ADD COLUMN "application_id" varchar(50);

        update npm_event_push_request t1 set application_id = t2.application
        from parcel t2
        where t1.tracking_number = t2.tracking_number;

        ALTER TABLE "public"."npm_event_push_request"
        ALTER COLUMN "application_id" SET NOT NULL;
      `);

      await queryRunner.query(`
        CREATE UNIQUE INDEX "UK_TRACKING_NUMBER_EVENT_CODE" ON "public"."npm_event_push_request" ("tracking_number","event_code");
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
