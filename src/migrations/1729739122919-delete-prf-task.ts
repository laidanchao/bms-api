import {MigrationInterface, QueryRunner} from "typeorm";

export class deletePrfTask1729739122919 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table if exists prf_task_detail
          rename column task_type to proof_type;
        alter table if exists prf_task_detail rename to ord_parcel_proof;
      `)
    // ALTER TABLE "public"."sct_crawler_config" RENAME COLUMN "officially" TO "official";
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table if exists ord_parcel_proof
          rename column proof_type to task_type;
        alter table if exists ord_parcel_proof rename to prf_task_detail;
      `)
  }

}
