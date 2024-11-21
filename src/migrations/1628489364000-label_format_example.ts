import { MigrationInterface, QueryRunner } from 'typeorm';

export class labelFormatExample1628489364000 implements MigrationInterface{
  async up(queryRunner: QueryRunner): Promise<any> {
    return await queryRunner.query(`ALTER TABLE "public"."channel_label_format" ADD COLUMN "exampleUrl" varchar;`);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    return await queryRunner.query(`ALTER TABLE "public"."channel_label_format" DROP COLUMN "exampleUrl";`);
  }

}
