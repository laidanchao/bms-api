import {MigrationInterface, QueryRunner} from "typeorm";

export class refactorChannel1616223190302 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel" RENAME TO "channel_channel"`);
      await queryRunner.query(`ALTER TABLE "transporter" RENAME TO "channel_transporter"`);
      await queryRunner.query(`ALTER TABLE "labelFormat" RENAME TO "channel_label_format"`);
      await queryRunner.query(`ALTER TABLE "transporterAccount" RENAME TO "channel_transporter_account"`);
      await queryRunner.query(`ALTER TABLE "transporterProduct" RENAME TO "channel_transporter_product"`);
      await queryRunner.query(`ALTER TABLE "route" RENAME TO "channel_route"`);
      await queryRunner.query(`ALTER TABLE "application" RENAME TO "channel_application"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "channel_channel" RENAME TO "channel"`);
      await queryRunner.query(`ALTER TABLE "channel_transporter" RENAME TO "transporter"`);
      await queryRunner.query(`ALTER TABLE "channel_label_format" RENAME TO "labelFormat"`);
      await queryRunner.query(`ALTER TABLE "channel_transporter_account" RENAME TO "transporterAccount"`);
      await queryRunner.query(`ALTER TABLE "channel_transporter_product" RENAME TO "transporterProduct"`);
      await queryRunner.query(`ALTER TABLE "channel_route" RENAME TO "route"`);
      await queryRunner.query(`ALTER TABLE "channel_application" RENAME TO "application"`);
    }

}
