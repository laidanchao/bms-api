import {MigrationInterface, QueryRunner} from "typeorm";

export class refactorOrm1610359053754 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      // 更新channel的transporter字段
      await queryRunner.query(`ALTER TABLE channel rename "transporter" to "transporterId"`)

    }

    public async down(): Promise<void> {
      // Nothing to do
    }

}
