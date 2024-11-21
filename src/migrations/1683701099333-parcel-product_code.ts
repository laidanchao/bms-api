import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelProductCode1683701099333 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      alter table "parcel" add column "product_code" varchar(100)
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
