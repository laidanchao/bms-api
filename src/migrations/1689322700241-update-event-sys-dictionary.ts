import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateEventSysDictionary1689322700241 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."sys_dictionary"
        ADD COLUMN "description" varchar(255);
    `);

    await queryRunner.query(`
      update sct_event set parcel_status='UNKNOWN' where parcel_status is null;
      update sct_event set parcel_status='BEFORE_TRANSIT' where event in ('CLEARED','COMCLI','COM_CLI','EXP_CLEARED') ;
    `)

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
