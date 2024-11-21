import {MigrationInterface, QueryRunner} from "typeorm";

export class transporterMethods1630568807702 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
      CREATE TABLE "transporter_methods" (
        "id" serial4,
        "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "transporter" varchar COLLATE "pg_catalog"."default" NOT NULL,
        "method" varchar COLLATE "pg_catalog"."default" NOT NULL,
        "description" varchar COLLATE "pg_catalog"."default",
        "isDocking" bool NOT NULL,
        CONSTRAINT "PK_transporter_methods_id" PRIMARY KEY ("id")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DROP TABLE "transporter_methods"`);
    }

}
