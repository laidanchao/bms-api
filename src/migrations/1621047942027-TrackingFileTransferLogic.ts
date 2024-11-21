import { MigrationInterface, QueryRunner } from 'typeorm';

export class parseAndClearTrackingFile1621047942027 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "colissimo_tracking_file_name_IDX" ON "colissimo_tracking_file" ("name")`);
    await queryRunner.query(`CREATE INDEX "colissimo_tracking_file_transporterAccountId_sourceDate_IDX" ON "colissimo_tracking_file" ("transporterAccountId", "sourceDate")`);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" ADD CONSTRAINT "colissimo_tracking_file_name_size_UK" UNIQUE ("name", "size")`);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" ADD COLUMN event varchar `);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" ADD COLUMN "isPushed" bool `);
    await queryRunner.query(`CREATE TABLE "event" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "resourceName" character varying NOT NULL, "event" character varying NOT NULL, "referenceId" integer NOT NULL, CONSTRAINT "event_id_PK" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "event_referenceId_resourceName_IDX" ON "event" ("referenceId","resourceName");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" DROP CONSTRAINT "colissimo_tracking_file_name_IDX"`);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" DROP CONSTRAINT "colissimo_tracking_file_transporterAccountId_sourceDate_IDX"`);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" DROP CONSTRAINT "colissimo_tracking_file_name_size_UK"`);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" DROP COLUMN event `);
    await queryRunner.query(`ALTER TABLE "colissimo_tracking_file" DROP COLUMN "isPushed"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP INDEX "event_referenceId_resourceName_IDX"`);
  }

}
