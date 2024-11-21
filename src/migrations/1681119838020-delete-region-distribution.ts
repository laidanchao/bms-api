import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteRegionDistribution1681119838020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('sts_region_distribution',true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
