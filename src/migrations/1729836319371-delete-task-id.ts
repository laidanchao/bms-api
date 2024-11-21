import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteTaskId1729836319371 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table ord_parcel_proof
          drop column task_id
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
