import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelMetadata1616555159487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE "parcel_metadata" ("id" SERIAL PRIMARY KEY,"application" VARCHAR NOT NULL,"transporter" VARCHAR NOT NULL,"status" VARCHAR NOT NULL,"createdDate" VARCHAR NOT NULL,"createdHour" VARCHAR NOT NULL,"declaredDate" VARCHAR NOT NULL,"declaredHour" VARCHAR NOT NULL,"createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,"declaredAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,"path" VARCHAR NOT NULL )')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('DROP TABLE "parcel_metadata"');
    }

}
