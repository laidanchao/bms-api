import {MigrationInterface, QueryRunner} from "typeorm";

export class update17trackEvent1722836195026 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        update sct_17track_event set type='IGNORED' where type='BLACK_LIST';
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
