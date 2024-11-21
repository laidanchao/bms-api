import {MigrationInterface, QueryRunner} from "typeorm";

export class channelAddField1655432447967 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         ALTER TABLE "public"."channel" ADD COLUMN "is_client_account" bool NOT NULL DEFAULT false;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."channel" DROP COLUMN "is_client_account"
      `)
    }

}
