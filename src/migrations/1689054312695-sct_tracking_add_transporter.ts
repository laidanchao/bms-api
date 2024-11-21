import {MigrationInterface, QueryRunner} from "typeorm";

export class sctTrackingAddTransporter1689054312695 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         ALTER TABLE "sct_tracking" ADD "transporter" varchar(50)
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
