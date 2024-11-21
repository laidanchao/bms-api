import {MigrationInterface, QueryRunner} from "typeorm";

export class ADDSourceCityInconsistentPostalCode1623311711941 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table "inconsistent_postal_code" ADD column source_city varchar;`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table "inconsistent_postal_code" DROP column source_city`)
    }

}
