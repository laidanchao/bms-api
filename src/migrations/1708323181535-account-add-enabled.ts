import {MigrationInterface, QueryRunner} from "typeorm";

export class accountAddEnabled1708323181535 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."cam_account"
          ADD COLUMN "enabled" bool;
      `)

      await queryRunner.query(`
        update cam_account set enabled='t';
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
