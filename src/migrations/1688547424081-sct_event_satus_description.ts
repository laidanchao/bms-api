import {MigrationInterface, QueryRunner} from "typeorm";

export class sctEventStatusDescription1688547424081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `CREATE TABLE if not exists "sct_event_status_description" (
                    "id" SERIAL NOT NULL,
                    "created_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                    "status" VARCHAR(50) NOT NULL,
                    "description" VARCHAR(50) NOT NULL
                )`);
      await queryRunner.query(`ALTER TABLE "public"."sct_event_status_description"
  ADD CONSTRAINT "uk_status" UNIQUE ("status");`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
