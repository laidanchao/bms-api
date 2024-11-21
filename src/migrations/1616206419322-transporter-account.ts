import { MigrationInterface, QueryRunner } from 'typeorm';

export class transporterAccount1616206419322 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transporterAccount" ADD COLUMN "applicationId" varchar`);
    await queryRunner.query(`ALTER TABLE "transporterAccount" ADD COLUMN "dedicatedClient" bool`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transporterAccount" DROP COLUMN "applicationId"`);
    await queryRunner.query(`ALTER TABLE "transporterAccount" DROP COLUMN "dedicatedClient"`);
  }

}
