import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteFileRecordPushed1676534986639 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('alter table sct_file_record drop column is_pushed')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
