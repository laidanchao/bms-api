import {MigrationInterface, QueryRunner} from "typeorm";

export class sysDictionary1687333748693 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
          CREATE TABLE "sys_dictionary" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "key" varchar(255) not null,
          "value" varchar(255) not null)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
