import {MigrationInterface, QueryRunner} from "typeorm";

export class colissimoInvoiceMetadata1618906949299 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('CREATE TABLE IF NOT EXISTS "public"."colissimo_invoice_metadata" ("id" serial2, "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP, "uploadDate" varchar(255), "name" varchar(255), "sourceDate" varchar, "size" int8, "lastModifyAt" timestamptz, "sftpAccount" varchar(255), "transporterAccountId" varchar, "month" varchar(7), "fileUrl" varchar(255), PRIMARY KEY ("id"));');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query('DROP TABLE IF EXISTS "public"."colissimo_invoice_metadata"; ');
    }

}


