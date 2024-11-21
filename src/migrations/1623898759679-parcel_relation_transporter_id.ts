import {MigrationInterface, QueryRunner} from "typeorm";

export class parcelRelationTransporterId1623898759679 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcel_relation" ADD "transporter_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "parcel_relation" drop column "transporter_id"`);
    }

}
