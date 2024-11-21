import { MigrationInterface, QueryRunner } from 'typeorm';

export class routeName1629442830000 implements MigrationInterface{
  async up(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "public"."channel_transporter_product" ADD COLUMN "name" varchar(255);`);
  }

  async down(queryRunner: QueryRunner) {
    await queryRunner.query(`ALTER TABLE "public"."channel_transporter_product" DROP COLUMN "name";`);
  }

}
