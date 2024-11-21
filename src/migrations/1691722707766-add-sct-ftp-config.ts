import {MigrationInterface, QueryRunner} from "typeorm";

export class addSctFtpConfig1691722707766 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "sct_ftp_setting" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "transporter" varchar(50) not null,
          "application" varchar(50) not null,
          "account" varchar(255) not null,
          "enabled" bool not null,
          "operator" varchar(50)
        )
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
