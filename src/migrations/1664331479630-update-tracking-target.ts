import {MigrationInterface, QueryRunner} from "typeorm";

export class updateTrackingTarget1664331479630 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
         ALTER TABLE "public"."tracking_target" ADD COLUMN "transporter" varchar(255);
      `)
      // 更新 transporter
      // await queryRunner.query(`
      //   UPDATE "public"."tracking_target" t0 set transporter = t1.transporter FROM "public"."parcel" t1 WHERE t0.tracking_number = t1.tracking_number
      // `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."tracking_target" DROP COLUMN "transporter"
      `)
    }

}
