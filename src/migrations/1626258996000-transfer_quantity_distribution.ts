import { MigrationInterface, QueryRunner } from 'typeorm';

export class transferQuantityDistribution1626258996000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "public"."transfer_quantity_distribution" (
        "id" serial4,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "transferredDate" timestamptz NOT NULL,
        "quantity" int4 NOT NULL,
        "transporter" varchar COLLATE "pg_catalog"."default" NOT NULL,
        "application" varchar COLLATE "pg_catalog"."default" NOT NULL,
        "clientId" varchar COLLATE "pg_catalog"."default" NOT NULL,
        "transporterAccountId" varchar COLLATE "pg_catalog"."default" NOT NULL,
        PRIMARY KEY ("id"),
        CONSTRAINT "UK_transporter_application_transferredDate" UNIQUE ("transporter", "application", "transferredDate", "clientId", "transporterAccountId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transfer_quantity_distribution"`);
  }
}
