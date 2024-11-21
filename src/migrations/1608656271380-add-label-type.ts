import {MigrationInterface, QueryRunner} from "typeorm";

export class addLabelType1608656271380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "labelFormat" ADD "labelType" varchar`);
      await queryRunner.query(`ALTER TABLE "labelFormat" ADD "labelSize" varchar`);
    }

    public async down(): Promise<void> {
      // Nothing to do
    }

}
