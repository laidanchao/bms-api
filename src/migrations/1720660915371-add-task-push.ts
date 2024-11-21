import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTaskPush1720660915371 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
        create table if not exists task_push_config (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "application" varchar(50) not null,
          "transporters" varchar,
          "task_type" varchar(50),
          "enabled" bool not null,
          "callback_type" varchar,
          "callback_header" varchar,
          "callback_url" varchar,
          "operator" varchar(50) not null
          )
      `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "index_task_push_config_application_taskType" ON "task_push_config" USING btree (
          "application","task_type"
        );
      `);

    await queryRunner.query(`
        create table if not exists task_push_request(
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "task_id" int,
          "task_code" varchar(50),
          "task_type" varchar(50),
          "application" varchar(50),
          "transporter" varchar(50),
          "zip_name" varchar,
          "zip_path" varchar,
          "zip_url" varchar,
          "status" varchar(50),
          "pushed_at" TIMESTAMP(6) WITH TIME ZONE,
          "failed_reason" varchar
          )
      `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX "index_task_push_request_task_code" ON "task_push_request" USING btree (
          "task_code"
        );
      `);

  }


  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
