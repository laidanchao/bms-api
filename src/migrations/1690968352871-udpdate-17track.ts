import { MigrationInterface, QueryRunner } from 'typeorm';

export class udpdate17track1690968352871 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."sct_17track"
          DROP COLUMN "effected_at";
      `);

      await queryRunner.query(`
        ALTER TABLE "public"."sct_17track_request"
          ADD COLUMN "register_status" varchar(20),
          ADD COLUMN "register_count" int2,
          ADD COLUMN "register_failed_reason" varchar(500),
          ADD COLUMN "application" varchar(20);
      `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
