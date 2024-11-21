import {MigrationInterface, QueryRunner} from "typeorm";

export class addSupplierDimension1678167525862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."parcel"
          ADD COLUMN "supplier_dimension" varchar(255);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
