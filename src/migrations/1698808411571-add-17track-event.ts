import {MigrationInterface, QueryRunner} from "typeorm";

export class add17trackEvent1698808411571 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "sct_17track_event" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "transporter" varchar(255),
          "description" varchar,
          "type" varchar(255)
        )
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
