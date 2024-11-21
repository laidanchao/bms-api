import {MigrationInterface, QueryRunner} from "typeorm";

export class updateCityPostalCode1662087375282 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."api_city_postal_code"
        ADD COLUMN "operator" varchar(255);
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."api_city_postal_code"
        DROP COLUMN "operator";
      `)
    }

}
