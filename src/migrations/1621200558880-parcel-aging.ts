import { MigrationInterface, QueryRunner } from 'typeorm';

export class parcelAging1621200558880 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "parcel_aging" (
        \t"id" SERIAL NOT NULL,
        \t"createdAt" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \t"updatedAt" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \t"trackingNumber" CHARACTER VARYING NOT NULL,
        \t"transporterId" CHARACTER VARYING NOT NULL,
        \t"transporterAccountId" CHARACTER VARYING,
        \t"channel" CHARACTER VARYING,
        \t"productCode" CHARACTER VARYING,
        \t"application" CHARACTER VARYING,
        \t"parcelCreatedAt" TIMESTAMP,
        \t"transferredAt" TIMESTAMP,
        \t"arrivedAt" TIMESTAMP,
        \t"deliveryAging" DOUBLE PRECISION NOT NULL,
        \t"status" CHARACTER VARYING NOT NULL,
        \t"sourceDeliveryAging" DOUBLE PRECISION NOT NULL,
        \t"transferredAtIsSunday" BOOLEAN NOT NULL,
        \t"arrivedAtIsSunday" BOOLEAN NOT NULL,
        \tCONSTRAINT "parcel_aging_trackingNumber_UK" UNIQUE ( "trackingNumber" ),
        CONSTRAINT "parcel_aging_id_PK" PRIMARY KEY ( "id" )
      );`,
    );
    await queryRunner.query(`
      CREATE TABLE "task_index" (
        \t"id" SERIAL NOT NULL,
        \t"createdAt" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \t"updatedAt" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \t"bucket" CHARACTER VARYING NOT NULL,
        \t"prefix" CHARACTER VARYING NOT NULL,
        \t"startAfterKey" CHARACTER VARYING NOT NULL,
        CONSTRAINT "task_index_id_PK" PRIMARY KEY ( "id" )
      );
    `);
    await queryRunner.query(`CREATE INDEX "task_index_bucket_prefix_IDX" ON "task_index" ("bucket", "prefix");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "parcel_aging" `);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_index" `);
    await queryRunner.query(`DROP INDEX "task_index_bucket_prefix_IDX"`);
  }

}
