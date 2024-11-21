import { MigrationInterface, QueryRunner } from "typeorm";

export class addTransporterAccountOperator1610471131034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transporterAccount" ADD "operator" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transporterAccount" DROP COLUMN "operator"`);
    }


}
