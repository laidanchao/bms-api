import {MigrationInterface, QueryRunner} from "typeorm";

export class update17trackRequest1696903599471 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_17track_request"
          ADD COLUMN "receiver_postal_code" varchar(50);
          ADD COLUMN "carrier_code_17track" varchar(50);
      `);

      await queryRunner.query(`
        ALTER TABLE "public"."sci_transporter"
          ADD COLUMN "carrier_code_17track" varchar(50);
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
