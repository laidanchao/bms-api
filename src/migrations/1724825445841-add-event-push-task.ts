import {MigrationInterface, QueryRunner} from "typeorm";

export class addEventPushTask1724825445841 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "npm_event_push_task" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "created_by" varchar(50) NOT NULL,
          "pushed_at" TIMESTAMP(6) WITH TIME ZONE,
          "application" varchar(50) NOT NULL,
          "client" varchar(50) NOT NULL,
          "parcel_quantity" int NOT NULL,
          "status" varchar(50)
        )
      `);

      await queryRunner.query(`
        alter table npm_event_push_request
          add column failed_reason varchar,
          add column task_id int
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
