import {MigrationInterface, QueryRunner} from "typeorm";

export class updateParcelPush1684313150014 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "public"."npm_parcel_push"
          ADD COLUMN "push_type" varchar(20);
      `);

      await queryRunner.query(`
        update npm_parcel_push set push_type='KAFKA';
        update npm_parcel_push set push_type='XPUSH' where client_id='ESENDEO';
      `)

      await queryRunner.query(`
        ALTER TABLE "public"."npm_parcel_push"
          ALTER COLUMN "push_type" SET NOT NULL;
      `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
