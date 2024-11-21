import {MigrationInterface, QueryRunner} from "typeorm";

export class pfcAnalysis1616033917187 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "colissimo_pfc_trip_time" RENAME TO "pfc_trip_time"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "pfc_trip_time" RENAME TO "colissimo_pfc_trip_time"`);
    }

}

