import {MigrationInterface, QueryRunner} from "typeorm";

export class trackingEventDefaultTimestamp1631243803394 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE tracking_event ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE tracking_event ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE tracking_event ALTER COLUMN "createdAt" DROP DEFAULT;
        ALTER TABLE tracking_event ALTER COLUMN "updatedAt" DROP DEFAULT;
      `)
    }
}
