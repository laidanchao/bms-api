import {MigrationInterface, QueryRunner} from "typeorm";

export class deleteTransporterUseless1695879228330 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('alter table sci_transporter drop column shipment_url;');
      await queryRunner.query('alter table sci_transporter drop column interface_doc;');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
