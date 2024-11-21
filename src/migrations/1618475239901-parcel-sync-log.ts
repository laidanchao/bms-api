import { MigrationInterface, QueryRunner } from 'typeorm';

export class parcelSyncLog1618475239901 implements MigrationInterface {
  name = 'parcelSyncLog1618475239901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parcelSyncLog" ADD "syncStatus" character varying DEFAULT 'INIT'`);
    await queryRunner.query(`ALTER TABLE "parcelSyncLog" ADD "uuId" character varying`);
    await queryRunner.query(`CREATE INDEX "IDX_parcelSyncLog_uuId" ON "parcelSyncLog" ("uuId") `);
    await queryRunner.query(`ALTER TABLE "parcelTrashCan" ADD "syncStatus" character varying DEFAULT 'INIT'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parcelSyncLog" DROP "syncStatus" `);
    await queryRunner.query(`ALTER TABLE "parcelSyncLog" DROP "uuId" `);
    await queryRunner.query(`DROP INDEX "IDX_parcelSyncLog_uuId" `);
    await queryRunner.query(`ALTER TABLE "parcelTrashCan" DROP "syncStatus"`);
  }

}
