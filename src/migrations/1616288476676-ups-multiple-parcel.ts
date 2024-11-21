import {MigrationInterface, QueryRunner} from "typeorm";

export class upsMultipleParcel1616288476676 implements MigrationInterface {
    name = 'upsMultipleParcel1616288476676';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "orderParcel_status_enum" AS ENUM('INIT', 'EXECUTING', 'FINISHED', 'FAIL')`);
        await queryRunner.query(`CREATE TABLE "orderParcel" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "reference" character varying NOT NULL, "uuId" character varying NOT NULL, "callBackUrl" character varying NOT NULL, "token" character varying NOT NULL, "trackingNumber" character varying, "shippingNumber" character varying, "application" character varying NOT NULL, "status" "orderParcel_status_enum" NOT NULL DEFAULT 'INIT', "reason" character varying, CONSTRAINT "PK_5e2882d2407eac46430c8d5d8a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "OrderParcel_reference_IDX" ON "orderParcel" ("reference") `);
        await queryRunner.query(`CREATE INDEX "OrderParcel_uuId_IDX" ON "orderParcel" ("uuId") `);
        await queryRunner.query(`CREATE INDEX "OrderParcel_trackingNumber_IDX" ON "orderParcel" ("trackingNumber") `);
        await queryRunner.query(`CREATE TYPE "order_status_enum" AS ENUM('INIT', 'EXECUTING', 'FINISHED', 'FAIL')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "reference" character varying NOT NULL, "uuId" character varying NOT NULL, "labelPath" character varying, "bucket" character varying, "callBackUrl" character varying NOT NULL, "token" character varying NOT NULL, "bodyS3Key" character varying NOT NULL, "status" "order_status_enum" NOT NULL DEFAULT 'INIT', "application" character varying NOT NULL, "reason" character varying, "parcelNumber" numeric, "costTime" numeric, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "Order_reference_IDX" ON "order" ("reference") `);
        await queryRunner.query(`CREATE INDEX "Order_uuId_IDX" ON "order" ("uuId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "Order_uuId_IDX"`);
        await queryRunner.query(`DROP INDEX "Order_reference_IDX"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
        await queryRunner.query(`DROP INDEX "OrderParcel_trackingNumber_IDX"`);
        await queryRunner.query(`DROP INDEX "OrderParcel_uuId_IDX"`);
        await queryRunner.query(`DROP INDEX "OrderParcel_reference_IDX"`);
        await queryRunner.query(`DROP TABLE "orderParcel"`);
        await queryRunner.query(`DROP TYPE "orderParcel_status_enum"`);
    }

}
