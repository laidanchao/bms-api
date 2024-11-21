import {MigrationInterface, QueryRunner} from "typeorm";

export class renameTrackingPush1669951259902 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table "tracking_push_log" rename to "npm_event_push_log";
        alter table "tracking_push" rename to "npm_event_push_request";
        alter table "tracking_webhook" rename to "npm_parcel_push";
        alter table "tracking_parcel_sync_log" rename to "npm_parcel_push_request";
        alter table "tracking_parcel_trash_can" rename to "npm_parcel_push_log";
        alter table "tracking_sync_config" rename to "npm_tracking_push";
        alter table "tracking_sync_log" rename to "npm_tracking_push_log";
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      //
    }

}
