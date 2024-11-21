import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class requestParam1608113708077 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'request-param',
          columns: [
            { name: 'id',                  type: 'int',                      isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
            { name: 'trackingNumber',      type: 'varchar',                  isNullable:true},
            { name: 'requestBody',         type: 'varchar',                  comment: '平台发送给我cms的请求',        isNullable: true},
            { name: 'transporterRequest',  type:'varchar',                   comment: 'cms发送给服务商的请求',        isNullable: true},
            { name: 'transporterResponse', type: 'varchar',                  comment: '服务商返回给cms的response',   isNullable: true},
            { name: 'createdAt',           type: 'timestamp with time zone', default: 'now()' },
            { name: 'updatedAt',           type: 'timestamp with time zone', default: 'now()' },
          ],
        }), true,
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('request-param',true)
    }

}
