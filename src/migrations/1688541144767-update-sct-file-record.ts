import {MigrationInterface, QueryRunner} from "typeorm";

export class updateSctFileRecord1688541144767 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_file_record"
          ADD COLUMN "transporter" varchar(50);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
