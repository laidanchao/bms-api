import {MigrationInterface, QueryRunner} from "typeorm";

export class track17Update1671185068867 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
       alter table if exists tracking_register rename to sct_17track_request;
       alter table if exists tracking_17track_config rename to sct_17track;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
