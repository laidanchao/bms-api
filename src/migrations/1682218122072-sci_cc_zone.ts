import {MigrationInterface, QueryRunner} from "typeorm";

export class sciCcZone1682218122072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
            CREATE TABLE if not exists "sci_cc_zone" (
                "id" SERIAL NOT NULL,
                "created_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
                "postal_code" VARCHAR(100) NOT NULL )
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
