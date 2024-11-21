import { MigrationInterface, QueryRunner } from 'typeorm';

export class refactorTrackingTarget1633744573000 implements MigrationInterface{
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE "public"."tracking_target"
        ADD COLUMN "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN "comment" varchar(255) DEFAULT '包裹轨迹持续抓取中',
        DROP COLUMN "timestamp";
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UK_TRACKING_TARGET_TRACKINGNUMBER_FILEPATH" ON "public"."tracking_target" ("trackingNumber","filePath");
      DROP INDEX "public"."INDEX_TRACKINGNUMBER";
    `)
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
      ALTER TABLE "public"."tracking_target"
        DROP COLUMN "createdAt",
        DROP COLUMN "updatedAt",
        DROP COLUMN "comment"
        ADD COLUMN "timestamp" timestamptz,
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "INDEX_TRACKINGNUMBER" ON "public"."tracking_target" ("trackingNumber");
      DROP INDEX "public"."UK_TRACKING_TARGET_TRACKINGNUMBER_FILEPATH";
    `)
  }

}
