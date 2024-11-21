import {MigrationInterface, QueryRunner} from "typeorm";

export class crawlerConfig1673403177849 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        CREATE TABLE if not exists "sct_crawler_config" (
          "id" SERIAL NOT NULL,
          "created_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP ( 6 ) WITH TIME ZONE NOT NULL DEFAULT now(),
          "transporter" CHARACTER VARYING NOT NULL,
          "accounts" json NOT NULL DEFAULT '[]',
          "crawler_cron" CHARACTER VARYING NOT NULL DEFAULT '0 0/10 * * * *',
          "enabled" BOOLEAN NOT NULL DEFAULT FALSE,
          "officially" BOOLEAN NOT NULL DEFAULT FALSE,
          "api_interface" CHARACTER varying,
          "max_times" INTEGER NOT NULL DEFAULT '120',
          CONSTRAINT "UQ_c33cf61af9d0b9337f714ae1de3" UNIQUE ( "transporter" ),
          CONSTRAINT "PK_7caf2efea62ad9838acbaf17d0c" PRIMARY KEY ( "id" )
        );`
      )
      await queryRunner.query(`
        COMMENT ON COLUMN "sct_crawler_config"."transporter" IS '线路';
        COMMENT ON COLUMN "sct_crawler_config"."accounts" IS '账号';
        COMMENT ON COLUMN "sct_crawler_config"."crawler_cron" IS '爬取Cron表达式';
        COMMENT ON COLUMN "sct_crawler_config"."enabled" IS '是否启用';
        COMMENT ON COLUMN "sct_crawler_config"."officially" IS '是否官方提供';
        COMMENT ON COLUMN "sct_crawler_config"."api_interface" IS '链接';
        COMMENT ON COLUMN "sct_crawler_config"."max_times" IS '最大爬取次数';`
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
