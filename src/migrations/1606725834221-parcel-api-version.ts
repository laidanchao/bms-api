import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelApiVersion1606725834221 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcels" ADD "apiVersion" character varying(255) DEFAULT 'v1'`);
      await queryRunner.query(`ALTER TABLE "parcels" ALTER COLUMN "apiVersion" SET NOT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcels" DROP COLUMN "apiVersion"`);
    }

}
