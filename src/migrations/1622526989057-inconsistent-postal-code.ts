import { MigrationInterface, QueryRunner } from 'typeorm';

export class inconsistentPostalCode1622526989057 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "inconsistent_postal_code" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "city" character varying, "postal_code" character varying, "client_id" character varying, "include" boolean DEFAULT false, "need_include" boolean DEFAULT false, CONSTRAINT "inconsistent_postal_code_id_PK" PRIMARY KEY ("id"));`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE  "inconsistent_postal_code"`);
  }

}
