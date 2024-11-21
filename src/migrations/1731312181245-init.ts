import {MigrationInterface, QueryRunner} from "typeorm";

export class init171731312181245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        create table if not exists crm_client (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "created_by" varchar(50),
          "updated_by" varchar(50),
          "client_name" varchar(50) not null,
          "company_name" varchar(50),
          "phone" varchar(50),
          "business_date" date,
          "status" varchar(50)
        );

        alter table if exists crm_client add primary key ("id");
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
