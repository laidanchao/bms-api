import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelAddIsAppointed1688630520081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `ALTER TABLE "parcel" ADD COLUMN "is_appointed" bool`
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
