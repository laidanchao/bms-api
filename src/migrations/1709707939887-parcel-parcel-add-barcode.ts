import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelParcelAddBarcode1709707939887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."ord_parcel_label"
          ADD COLUMN "barcode" varchar(255);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
