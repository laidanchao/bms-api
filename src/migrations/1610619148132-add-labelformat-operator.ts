import { MigrationInterface, QueryRunner } from "typeorm";

export class addLabelformatOperator1610619148132 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labelFormat" ADD "operator" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "labelFormat" DROP COLUMN "operator"`);
    }

}
