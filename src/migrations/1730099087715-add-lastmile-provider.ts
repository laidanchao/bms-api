import {MigrationInterface, QueryRunner} from "typeorm";

export class addLastmileProvider1730099087715 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        create table if not exists sci_lastmile_provider (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_by" varchar(50),
          "lastmile_provider" varchar(50) not null,
          "pod_enabled" bool not null,
          "pow_enabled" bool not null
        );

        ALTER TABLE if exists sci_lastmile_provider ADD PRIMARY KEY ("id");
      `);

      await queryRunner.query(`
        CREATE UNIQUE INDEX "index_sci_lastmile_provider_lastmile_provider" ON "sci_lastmile_provider" USING btree (
          "lastmile_provider"
        );
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
