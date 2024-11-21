import { MigrationInterface, QueryRunner } from 'typeorm';

export class onlineParcel1623406930606 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          CREATE TABLE "craw_parcel_task_scheduler" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "command_id" character varying NOT NULL, "status" character varying NOT NULL, "doc_url" character varying NOT NULL, "tracking_plan_ids" jsonb, CONSTRAINT "craw_parcel_task_scheduler_id_PK" PRIMARY KEY ("id"));
          CREATE TABLE "parcel_relation" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "batch_id" character varying, "command_id" character varying NOT NULL, "box_id" character varying NOT NULL, "stock_out_at" TIMESTAMP WITH TIME ZONE, "tracking_number" character varying NOT NULL, "eta" TIMESTAMP WITH TIME ZONE, "transporter" character varying NOT NULL, "docUrl" character varying NOT NULL, CONSTRAINT "parcel_relation_id_PK" PRIMARY KEY ("id"));
          CREATE INDEX "parcel_relation_command_id_IDX" ON "parcel_relation" ("command_id");
          CREATE INDEX "parcel_relation_tracking_number_IDX" ON "parcel_relation" ("tracking_number");
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          DROP TABLE "craw_parcel_task_scheduler" ;
          DROP INDEX "parcel_relation_command_id_IDX";
          DROP INDEX "parcel_relation_tracking_number_IDX";
          DROP TABLE "parcel_relation";
      `)
    }

}
