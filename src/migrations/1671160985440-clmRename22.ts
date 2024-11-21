import {MigrationInterface, QueryRunner} from "typeorm";

export class clmRename221671160985440 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
       alter table if exists bill_colissimo_invoice_metadata rename to clm_invoice;

      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
