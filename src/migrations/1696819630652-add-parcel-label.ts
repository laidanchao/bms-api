import {MigrationInterface, QueryRunner} from "typeorm";

export class addParcelLabel1696819630652 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "ord_parcel_label" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "parcel_id" int4 not null,
          "tracking_number" varchar(255) not null,
          "format" varchar(255) not null,
          "path" varchar(255) not null
        )
      `);

      await queryRunner.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "UK_ord_parcel_label_parcel_id" ON "public"."ord_parcel_label" ("parcel_id");
          CREATE INDEX IF NOT EXISTS "UK_ord_parcel_label_tracking_number" ON "public"."ord_parcel_label" ("tracking_number");
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
