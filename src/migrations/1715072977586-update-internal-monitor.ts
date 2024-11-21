import {MigrationInterface, QueryRunner} from "typeorm";

export class updateInternalMonitor1715072977586 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table sct_internal_monitor
          add column if not exists transporter varchar(50),
          add column if not exists archived_ftp int default 0,
          add column if not exists received_ftp int default 0,
          add column if not exists expected_collect_quantity_17track int default 0,
          add column if not exists collected_quantity_17track int default 0,
          add column if not exists register_failed_quantity_17track int default 0,
          add column if not exists got_tracking_quantity int default 0
      `)

      await queryRunner.query(`
        update sct_internal_monitor set archived_ftp = archived_cp_ftp + archived_cm_ftp,
        received_ftp = received_cp_ftp + received_cm_ftp
      `)

      await queryRunner.query(`
         alter table sct_internal_monitor
          drop column if exists archived_cp_ftp,
          drop column if exists archived_cm_ftp,
          drop column if exists received_cp_ftp,
          drop column if exists received_cm_ftp
      `)

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
