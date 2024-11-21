import {MigrationInterface, QueryRunner} from "typeorm";

export class updateEvent1702608101864 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE if EXISTS sct_description_map RENAME TO sct_cms_event;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
