import {MigrationInterface, QueryRunner} from "typeorm";

export class sctInternalMonitor1681805278619 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `CREATE TABLE if not exists "sct_internal_monitor" (
                    "id" SERIAL NOT NULL,
                    "created_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                    "date" date,
                    "is_abnormal" BOOLEAN NOT NULL DEFAULT FALSE,
                    "expected_collect_quantity" INT NOT NULL DEFAULT 0,
                    "actual_collect_quantity" INT NOT NULL DEFAULT 0,
                    "expected_push_quantity" INT NOT NULL DEFAULT 0,
                    "actual_push_quantity" INT NOT NULL DEFAULT 0,
                    "archived_cm_ftp" INT NOT NULL DEFAULT 0,
                    "received_cm_ftp" INT NOT NULL DEFAULT 0,
                    "archived_cp_ftp" INT NOT NULL DEFAULT 0,
                    "received_cp_ftp" INT NOT NULL DEFAULT 0,
                    "abnormal_file_url" VARCHAR(500)
                )`)

      await queryRunner.query(`ALTER TABLE "public"."sct_internal_monitor"
  ADD CONSTRAINT "date_uk" UNIQUE ("date");
COMMENT ON CONSTRAINT "date_uk" ON "public"."sct_internal_monitor" IS '一天只生成一条数据';`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
