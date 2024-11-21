import {MigrationInterface, QueryRunner} from "typeorm";

export class addChannelTransporterAccess1636707482645 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel_transporter" ADD "access_method" varchar, ADD "extra_service" json, ADD "interface_doc" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel_transporter" DROP COLUMN "access_method", DROP COLUMN "extra_service", DROP COLUMN "interface_doc"`);
    }

}
