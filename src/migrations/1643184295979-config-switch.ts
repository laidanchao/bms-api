import {MigrationInterface, QueryRunner} from "typeorm";

export class configSwitch1643184295979 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE "api_config_switch" (
          \t"id" SERIAL NOT NULL,
          \t"created_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \t"updated_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \t"client_id" CHARACTER VARYING,
          \t"application_id" CHARACTER VARYING,
          \t"enable" bool,
          CONSTRAINT "api_config_switch_id_PK" PRIMARY KEY ( "id" )
        );
    `);
      await queryRunner.query(`insert into api_config_switch("client_id", "application_id", "enable") values('HK4PX-VIP', 'FTL-OMS', false)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`drop table api_config_switch`);
    }

}
