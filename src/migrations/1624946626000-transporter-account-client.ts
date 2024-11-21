import { MigrationInterface, QueryRunner } from 'typeorm';

export class transporterAccountClient1624946626000 implements MigrationInterface{

  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "public"."channel_transporter_account" ADD COLUMN "clientId" varchar;`);
    await queryRunner.query(`ALTER TABLE "public"."channel_transporter_account" DROP COLUMN "dedicatedClient";`);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "public"."channel_transporter_account" DROP COLUMN "clientId";`);
  }

}
