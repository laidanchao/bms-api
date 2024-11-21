import {MigrationInterface, QueryRunner} from "typeorm";

export class transporterRuleAddType1628647556332 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporter_rule" ADD "type" character varying;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporter_rule" DROP column "type"`)
    }

}
