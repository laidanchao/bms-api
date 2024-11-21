import { MigrationInterface, QueryRunner } from 'typeorm';

export class trackingEvent1629093286000 implements MigrationInterface{
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`
      CREATE TABLE "public"."tracking_event" (
        "id" serial4,
        "createdAt" timestamptz,
        "updatedAt" timestamptz,
        "transporter" varchar(255),
        "event" varchar(255) NOT NULL,
        "parcelStatus" varchar(255),
        "zh" varchar(255),
        "en" varchar(255),
        "fr" varchar(255),
        PRIMARY KEY ("id")
      );
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UK_IDX_EVENT" ON "public"."tracking_event" ("event")`);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`drop table tracking_event`);
  }
}
