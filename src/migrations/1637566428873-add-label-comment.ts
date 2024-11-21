import {MigrationInterface, QueryRunner} from "typeorm";

export class addLabelComment1637566428873 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel_label_format" ADD "comment" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel_label_format" DROP COLUMN "comment"`);
    }

}
