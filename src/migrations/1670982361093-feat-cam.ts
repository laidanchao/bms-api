import {MigrationInterface, QueryRunner} from "typeorm";

export class featCam1670982361093 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('alter table if exists channel_application rename to cam_application;');
      await queryRunner.query('alter table if exists channel rename to cam_channel;');
      await queryRunner.query('alter table if exists channel_transporter_account rename to cam_account;');
      await queryRunner.query('alter table if exists channel_label_format rename to sci_label_format;');
      await queryRunner.query('alter table cam_channel drop column sub_account;');
      await queryRunner.query('alter table cam_account drop column client_id;');
      await queryRunner.query('alter table cam_account drop column last_invoiced_at;');
      await queryRunner.query('alter table cam_account drop column sub_account;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
