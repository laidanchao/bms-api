import {MigrationInterface, QueryRunner} from "typeorm";

export class addChannelOperator1608114509334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel" ADD "operator" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "operator"`);
    }

}
