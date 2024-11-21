import {MigrationInterface, QueryRunner} from "typeorm";

export class transporterRuleAddRules1628247149470 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporter_rule" ADD "application" character varying; ALTER TABLE "transporter_rule" ADD "rules" jsonb`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporter_rule" DROP column "application", DROP COLUMN "rules";`)
    }

}
