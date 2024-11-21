import { MigrationInterface, QueryRunner } from "typeorm";

export class addTransporterProductOperator1609340494597 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transporterProduct" ADD "operator" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transporterProduct" DROP COLUMN "operator"`);
    }

}
