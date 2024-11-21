import {MigrationInterface, QueryRunner} from "typeorm";

export class renameSct1670224436529 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.query(`
        alter table "tracking" rename to "sct_tracking";
        alter table "tracking_event" rename to "sct_event";
        alter table "tracking_file" rename to "sct_file_record";
        alter table "tracking_file_event" rename to "sct_file_log";
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
