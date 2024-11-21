import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteApplicationApikey1696668007593 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('alter table cam_application drop column api_key;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
