import {MigrationInterface, QueryRunner} from "typeorm";

export class platformAddTrack171731312181245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        alter table ssm_platform
          add column track17_account varchar(50),
          add column track17_password varchar(50),
          add column track17_key varchar(50);
      `)

      await queryRunner.query(`
        update ssm_platform pp set track17_account=tt.account,track17_password=tt.password,track17_key=tt.key
        from sct_17track_account tt
        where pp.id = tt.application;
      `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
