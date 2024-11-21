import {MigrationInterface, QueryRunner} from "typeorm";

export class addTask1712481869038 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            CREATE TABLE if not exists "task" (
              "id" SERIAL NOT NULL,
              "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "code" varchar(50) NOT NULL,
              "type" varchar(50) NOT NULL,
              "transporter" varchar(50),
              "status" varchar(50),
              "is_sync" bool,
              "push_status" varchar(50),
              "push_failed_reason" varchar,
              "callback_url" varchar,
              "callback_header" varchar,
              "zip_file_name" varchar,
              "zip_file_path" varchar,
              "zip_url" varchar
            )
        `);

      await queryRunner.query(`
           CREATE TABLE if not exists "task_detail" (
              "id" SERIAL NOT NULL,
              "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "task_id" int,
              "task_code" varchar(50),
              "task_type" varchar(50),
              "tracking_number" varchar(50),
              "transporter" varchar(50),
              "status" varchar(50),
              "file_name" varchar(255),
              "file_path" varchar,
              "url" varchar,
              "failed_reason" varchar
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
