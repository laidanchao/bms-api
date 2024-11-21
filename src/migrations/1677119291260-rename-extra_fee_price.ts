import {MigrationInterface, QueryRunner} from "typeorm";

export class renameExtraFeePrice1677119291260 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`alter table "bill_extra_fee_price" rename to "scb_surcharge_price_log"`)
      await queryRunner.query(`
        alter table "scb_surcharge_price_log"
        add column "status" varchar(50),
        add column "price_id" int default 0`
        )
      await queryRunner.query(`
        update "scb_surcharge_price_log" set status = 'DELETED' where is_deleted = 't' ;
        update "scb_surcharge_price_log" set status = 'EDIT' where is_deleted = 'f' ;`
      )
      await queryRunner.query(`
        alter table "scb_surcharge_price_log"
        drop column "is_deleted",
        drop column "deleted_at",
        alter column "value" TYPE varchar(50) USING "value"::varchar(50)
       `)

      await queryRunner.query(`
        CREATE TABLE "public"."scb_surcharge_price" (
          "id" serial4,
          "month" varchar(50) NOT NULL,
          "transporter" varchar(50) NOT NULL,
          "type" varchar(50) NOT NULL,
          "country_code" varchar(50),
          "value" varchar(50),
          "comment" varchar(255),
          "operator" varchar(100) NOT NULL,
          "created_at" timestamptz(6) NOT NULL DEFAULT now(),
          "updated_at" timestamptz(6) NOT NULL DEFAULT now())
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
