import {MigrationInterface, QueryRunner} from "typeorm";

export class updateDescriptionMap1701842221577 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_description_map"
          ADD COLUMN "priority" int2 DEFAULT 0;
      `)

      await queryRunner.query(`
        update sct_description_map set priority=0;
      `)

      await queryRunner.query(`
        ALTER TABLE "public"."sct_description_map"
          ALTER COLUMN "priority" SET NOT NULL;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
