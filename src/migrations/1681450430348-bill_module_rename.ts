import {MigrationInterface, QueryRunner} from "typeorm";

export class billModuleRename1681450430348 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists "bill_extra_fee" rename to "scb_bill_surcharge";
        alter table if exists "bill_extra_fee_detail " rename to "sts_surcharge_distribution";
        alter table if exists "bill_indemnity_fee_detail" rename to "scb_indemnity_detail";
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
