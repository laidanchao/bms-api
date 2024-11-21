import { MigrationInterface, QueryRunner } from 'typeorm';

export class colissimoTrackingFile1618890884863 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "colissimo_tracking_file" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "uploadDate" character varying NOT NULL, "name" character varying NOT NULL, "sourceDate" character varying NOT NULL, "size" bigint NOT NULL, "lastModifyAt" TIMESTAMP WITH TIME ZONE NOT NULL, "sftpAccount" character varying NOT NULL, "transporterAccountId" character varying NOT NULL, "fileUrl" character varying NOT NULL, CONSTRAINT "PK_colissimo_tracking_file" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop table "colissimo_tracking_file"`)
  }

}
