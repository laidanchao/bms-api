import {MigrationInterface, QueryRunner} from "typeorm";

export class addAnalysis1710149823317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "sts_analysis" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "transporter" varchar(50) not null,
          "origin_file_path" varchar(255),
          "result_file_path" varchar(255),
          "total_count" INT,
          "success_count" INT,
          "failed_count" INT,
          "a_count" INT,
          "d_count" INT,
          "a_rate" numeric(10,2),
          "d_rate" numeric(10,2),
          "d_aging_avg" numeric(10,2),
          "status" varchar(50) not null,
          "operator" varchar(50)
        )
      `);

      await queryRunner.query(`
        CREATE TABLE if not exists "sts_analysis_detail" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "analysis_id" int NOT NULL,
          "tracking_number" varchar(255) not null,
          "a_scan" TIMESTAMP(6) WITH TIME ZONE,
          "d_scan" TIMESTAMP(6) WITH TIME ZONE,
          "d_aging" numeric(10,2),
          "failed_reason" varchar
        )
      `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
