import {MigrationInterface, QueryRunner} from "typeorm";

export class trackingNumberPool1679368469440 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE IF NOT EXISTS "public"."tracking_number_pool" (\n' +
        '  "id" serial NOT NULL,\n' +
        '  "tracking_number" varchar(64) COLLATE "pg_catalog"."default" NOT NULL,\n' +
        '  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,\n' +
        '  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,\n' +
        '  PRIMARY KEY ("id"),\n' +
        '  UNIQUE ("tracking_number")\n' +
        ')');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
