import {MigrationInterface, QueryRunner} from "typeorm";

export class sctTrackingMonitor1689668493257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.query(`CREATE TABLE "sct_tracking_monitor" (
                     "id" SERIAL NOT NULL,
                     "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                     "date" date not null,
                     "type" varchar(100) not null,
                     "transporter" varchar(255) not null,
                     "fast_num" int4,
                     "medium_num" int4,
                     "attention_num" int4,
                     "late_num" int4,
                     "total_num" int4,
                     "fast_rate" decimal(10,4),
                     "medium_rate" decimal(10,4),
                     "attention_rate" decimal(10,4),
                     "late_rate" decimal(10,4),
                     "late_file_url" varchar(255)
                     )
                     `);
      await queryRunner.query(`
            ALTER TABLE "public"."sct_tracking_monitor"
        ADD CONSTRAINT "uk_type_date_transporter" UNIQUE ("date", "type", "transporter");

        COMMENT ON CONSTRAINT "uk_type_date_transporter" ON "public"."sct_tracking_monitor" IS '一天一个派送商一种类型的数据统计';`
      )

      await queryRunner.query(`
          ALTER TABLE "public"."sct_tracking"
        ADD COLUMN "time_difference" int8,
        ADD COLUMN "get_file_time" timestamptz(6),
        ADD COLUMN "transporter_delay_time" int8;

      COMMENT ON COLUMN "public"."sct_tracking"."time_difference" IS 'created_at-timestamp(min)';

      COMMENT ON COLUMN "public"."sct_tracking"."get_file_time" IS 'ftp last_modify_at';

      COMMENT ON COLUMN "public"."sct_tracking"."transporter_delay_time" IS 'get_file_time-timestamp(min)';

    `)
     await queryRunner.query(`
           ALTER TABLE "public"."npm_tracking_push_log"
        ADD COLUMN "pushed_at" timestamptz(6),
        ADD COLUMN "pushed_time_difference" int8,
        ADD COLUMN "get_file_time" timestamptz(6),
        ADD COLUMN "transporter_delay_time" int8;
     `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
