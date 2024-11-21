import { MigrationInterface, QueryRunner } from 'typeorm';

export class cityPostalCode1618894367978 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "public"."city_postal_code" ("id" int4 NOT NULL DEFAULT nextval(\'city_postal_code_id_seq\'::regclass),"postal_code" varchar(255) COLLATE "pg_catalog"."default","city" varchar(255) COLLATE "pg_catalog"."default","coordinate" varchar(255) COLLATE "pg_catalog"."default",CONSTRAINT "city_postal_code_pkey" PRIMARY KEY ("id"),CONSTRAINT "UK_CITY_POSTAL_CODE" UNIQUE ("postal_code", "city"));');
    await queryRunner.query('COMMENT ON CONSTRAINT "UK_CITY_POSTAL_CODE" ON "public"."city_postal_code" IS \'邮编城市组合唯一键\';')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "public"."city_postal_code"')
  }

}
