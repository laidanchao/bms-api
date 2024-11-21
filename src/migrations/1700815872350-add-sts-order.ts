import {MigrationInterface, QueryRunner} from "typeorm";

export class addStsOrder1700815872350 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "sts_order" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "type" varchar(50),
          "date" varchar(50),
          "quantity" int4
        )
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
