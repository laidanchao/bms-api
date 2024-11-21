import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class transporterAccount1604668820237 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'transporterAccount',
        columns: [
          { name: 'id',              type: 'int',      isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'account',         type: 'varchar',  comment: '服务商账号' },
          { name: 'transporterId',   type: 'varchar',  comment: '服务商' },
          { name: 'subAccount',      type: 'varchar',  comment: '子账号',  default: 0},
          { name: 'accountInfo',     type: 'jsonb',    comment: '账号对接信息'  },
          { name: 'lastInvoicedAt',  type: 'varchar',  comment: '最后一次账单月份', isNullable:true  },
          { name: 'createdAt',       type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt',       type: 'timestamp with time zone', default: 'now()' },
        ],
        uniques: [{name: 'account_subAccount', columnNames: ['account', 'subAccount']}],
        foreignKeys:[
          {name:'transporter_account',columnNames:['transporterId'],referencedTableName:'transporter',referencedColumnNames:['id']}
        ]
      }), true);
    }

    public async down(): Promise<void> {
      // do nothing
    }

}
