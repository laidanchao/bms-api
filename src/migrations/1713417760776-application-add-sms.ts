import {MigrationInterface, QueryRunner} from "typeorm";

export class applicationAddSms1713417760776 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table cam_application
          add column sms_product_code varchar(50),
          add column sms_transporters varchar,
          add column sms_is_push_outside bool
      `)

      await queryRunner.query(`
        update cam_application set sms_product_code = id;
        update cam_application set sms_is_push_outside = true where id='ESENDEO';
        update cam_application set sms_is_push_outside = false where id!='ESENDEO';
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
