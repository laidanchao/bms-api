import {MigrationInterface, QueryRunner} from "typeorm";

export class clmRename201671072436560 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
       alter table if exists bill_reconcile rename to clm_reconciliation;
       alter table if exists bill_reconcile_detail rename to clm_reconciliation_detail;
       alter table if exists bill_cost_price rename to clm_reconciliation_price;
       alter table if exists bill_extra_fee_check rename to clm_surcharge_check;
       alter table if exists bill_surcharge_refund rename to clm_surcharge_refund;
       alter table if exists bill_actual_refund_file rename to clm_surcharge_refund_file;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
