import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class channel1604933592221 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.createTable(new Table({
        name: 'platform',
        columns:[
          { name: 'id',        type: 'varchar', isPrimary: true },
          { name: 'apiKey',    type: 'varchar' },
          { name: 'note',      type: 'varchar', isNullable:true },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
        ]
      }),true);

      await queryRunner.createTable(new Table({
        name: 'channel',
        columns: [
          { name: 'id',                  type: 'int',                      isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'code',                type: 'varchar',                  comment: '渠道代码', isUnique:true },
          { name: 'transporter',         type: 'varchar',                  comment: '服务商'    },
          { name: 'account',             type: 'varchar',                  comment: '账号' },
          { name: 'platform',         type: 'varchar',                  comment: '平台' },
          { name: 'subAccount',          type: 'varchar',                  comment: '子账号',  isNullable: true},
          { name: 'ftlRoute',            type: 'varchar',                  comment: '法翔线路名称'  },
          { name: 'comment',             type: 'varchar',                  comment: '渠道信息备注', isNullable:true  },
          { name: 'isActive',            type: 'boolean',                  comment: '是否激活渠道'  },
          { name: 'isSupportMulti',      type: 'boolean',                  comment: '是否支持多包裹'  },
          { name: 'lastShipmentAt',      type: 'varchar',                  comment: '最后一次下单时间',  isNullable:true },
          { name: 'lastParcelNumber',    type: 'varchar',                  comment: '最后一次包裹跟踪号', isNullable:true },
          { name: 'isSupportInsurance',  type: 'boolean',                  comment: '是否支持保险服务' },
          { name: 'isUploadS3',          type: 'boolean',                  comment: '是否直接上传S3' },
          { name: 'isDeliverSat',        type: 'boolean',                  comment: '是否直接上传S3' },
          { name: 'createdAt',           type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt',           type: 'timestamp with time zone', default: 'now()' },
        ],
        foreignKeys:[
          {name: 'channel_transporter',   columnNames:['transporter'], referencedTableName:'transporter',        referencedColumnNames:['id']},
          {name: 'channel_ftl_route',     columnNames:['ftlRoute'],    referencedTableName:'transporterProduct', referencedColumnNames:['ftlRoute']},
          {name: 'FK_channel_application',columnNames:['application'], referencedTableName:'application',        referencedColumnNames:['id']}
        ]
      }), true);
    }

    public async down(): Promise<void> {
      // do nothing
    }

}
