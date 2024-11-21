import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class transporterProduct1604484101638 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'transporterProduct',
        columns: [
          { name: 'id',              type: 'int',                      isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'transporterId',   type: 'varchar',                  comment: '服务商名称' },
          { name: 'productCode',     type: 'varchar',                  comment: '服务商产品代码'},
          { name: 'ftlRoute',        type: 'varchar',                  comment: '自定义产品路线', isUnique:true},
          { name: 'createdAt',       type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt',       type: 'timestamp with time zone', default: 'now()' },
        ],
        foreignKeys:[
          {name:'transporter_product',columnNames:['transporterId'],referencedTableName:'transporter',referencedColumnNames:['id']}
        ]
      }),
        true,
      );
    }

    public async down(): Promise<void> {
      // do nothing
    }

}
