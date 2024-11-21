import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class labelFormat1606125228155 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'labelFormat',
        columns:[
          { name: 'id',              type: 'int',                      isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'transporterId',   type: 'varchar',                  comment: '服务商名称' },
          { name: 'code',            type: 'varchar',                  comment: '自定义面单代码' },
          { name: 'value',           type: 'varchar',                  comment: '服务商面单代码'},
          { name: 'createdAt',       type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt',       type: 'timestamp with time zone', default: 'now()' },
        ],
        uniques:[{name:'UQ_code_transporter_id',columnNames:['code','transporterId']}]
      }),true)
    }

    public async down(): Promise<void> {
      // do nothing
    }

}
