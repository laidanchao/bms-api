import { MigrationInterface, QueryRunner } from 'typeorm';

export class channelApplicationId1616393897134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.renameColumn('channel_channel','application','applicationId');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.renameColumn('channel_channel','applicationId','application');
    }

}
