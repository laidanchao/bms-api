import {MigrationInterface, QueryRunner} from "typeorm";

export class renameSts1670482840112 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        drop table if exists statistic_declare_quantity_distribution;
        drop table if exists statistic_transfer_quantity_distribution;
        drop table if exists statistic_pfc;
        drop table if exists statistic_pfc_trip_time;
      `);
      await queryRunner.query(`
        alter table if exists statistic_bill_weight_distribution rename to sts_weight_distribution;
        alter table if exists statistic_bill_region_distribution rename to sts_region_distribution;
        alter table if exists statistic_average_parcel_aging rename to sts_average_parcel_aging;
        alter table if exists statistic_parcel_aging rename to sts_parcel_aging;
        alter table if exists statistic_quantity_distribution rename to sts_quantity_distribution;
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
