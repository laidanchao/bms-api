import {MigrationInterface, QueryRunner} from "typeorm";

export class transporterRule1620875170088 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`CREATE TABLE IF NOT EXISTS "transporter_rule" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "enable" boolean NOT NULL, "client" character varying NOT NULL, CONSTRAINT "PK_21d2bd9545ec203fb65c372acaf" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE IF EXISTS "transporter_rule" `);
    }

}
