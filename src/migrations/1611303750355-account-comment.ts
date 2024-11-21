import {MigrationInterface, QueryRunner} from "typeorm";

export class accountChannelComment1611303750355 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporterAccount" ADD "comment" varchar`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "transporterAccount" DROP COLUMN "comment"`)
    }

}
