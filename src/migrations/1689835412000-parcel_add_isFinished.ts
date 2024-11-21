import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelAddIsFinished1689835412000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `ALTER TABLE "ord_parcel" ADD COLUMN "is_finished" bool`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
