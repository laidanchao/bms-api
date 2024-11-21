import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTrackingFetchRecord1661742622417 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."tracking_fetch_record"
        ADD COLUMN "transporter_id" varchar(20);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."tracking_fetch_record"
        DROP COLUMN "transporter_id";
      `)
    }

}
