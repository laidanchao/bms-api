import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelInsurance1606123306241 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcels" ADD "insuranceValue" numeric DEFAULT 0`);
      await queryRunner.query(`ALTER TABLE "parcels" ALTER COLUMN "insuranceValue" SET NOT NULL`);
      await queryRunner.query(`ALTER TABLE "parcels" ADD "channel" character varying(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcels" DROP COLUMN "insuranceValue"`);
      await queryRunner.query(`ALTER TABLE "parcels" DROP COLUML "channel"`);
    }

}
