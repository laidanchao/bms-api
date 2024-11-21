import {MigrationInterface, QueryRunner} from "typeorm";

export class proofRenameTransporter1730190397422 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists ord_parcel_proof
          rename column transporter to lastmile_provider;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table if exists ord_parcel_proof
          rename column lastmile_provider to transporter;
      `)
    }

}
