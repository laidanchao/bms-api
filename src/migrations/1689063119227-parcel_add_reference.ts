import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelAddReference1689063119227 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `alter table "parcel" add "reference" varchar(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
