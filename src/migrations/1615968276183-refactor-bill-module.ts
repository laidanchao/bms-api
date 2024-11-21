import {MigrationInterface, QueryRunner} from "typeorm";

export class refactorBillModule1615968276183 implements MigrationInterface {
    name = 'refactorBillModule1615968276183';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "purchaseBill" RENAME TO "bill_purchase_bill"`);
      await queryRunner.query(`ALTER TABLE "weightDistribution" RENAME TO "bill_weight_distribution"`);
      await queryRunner.query(`ALTER TABLE "regionDistribution" RENAME TO "bill_region_distribution"`);
      await queryRunner.query(`ALTER TABLE "fuelRate" RENAME TO "bill_fuel_rate"`);
      await queryRunner.query(`ALTER TABLE "billTask" RENAME TO "bill_bill_task"`);
      await queryRunner.query(`ALTER TABLE "billTaskTemplate" RENAME TO "bill_bill_task_template"`);
      await queryRunner.query(`ALTER TABLE "purchaseBillExtraFee" RENAME TO "bill_extra_fee"`);
      await queryRunner.query(`ALTER TABLE "purchaseDetail" RENAME TO "bill_purchase_detail"`);
      await queryRunner.query(`ALTER TABLE "purchaseMailDetail" RENAME TO "bill_purchase_mail_detail"`);
      await queryRunner.query(`ALTER TABLE "indemnityFeeDetail" RENAME TO "bill_indemnity_fee_detail"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "bill_purchase_bill" RENAME TO "purchaseBill"`);
      await queryRunner.query(`ALTER TABLE "bill_weight_distribution" RENAME TO "weightDistribution"`);
      await queryRunner.query(`ALTER TABLE "bill_region_distribution" RENAME TO "regionDistribution"`);
      await queryRunner.query(`ALTER TABLE "bill_fuel_rate" RENAME TO "fuelRate"`);
      await queryRunner.query(`ALTER TABLE "bill_bill_task" RENAME TO "billTask"`);
      await queryRunner.query(`ALTER TABLE "bill_bill_task_template" RENAME TO "billTaskTemplate"`);
      await queryRunner.query(`ALTER TABLE "bill_extra_fee" RENAME TO "purchaseBillExtraFee"`);
      await queryRunner.query(`ALTER TABLE "bill_purchase_detail" RENAME TO "purchaseDetail"`);
      await queryRunner.query(`ALTER TABLE "bill_purchase_mail_detail" RENAME TO "purchaseMailDetail"`);
      await queryRunner.query(`ALTER TABLE "bill_indemnity_fee_detail" RENAME TO "indemnityFeeDetail"`);
    }

}
