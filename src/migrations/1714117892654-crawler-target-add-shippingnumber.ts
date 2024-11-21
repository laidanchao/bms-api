import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerTargetAddShippingnumber1714117892654 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table sct_crawler_target
         add column if not exists shipping_number varchar(50)
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
