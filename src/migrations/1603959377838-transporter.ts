import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class transporter1603959377838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transporter',
        columns: [
          { name: 'id',                type: 'varchar',                  comment: '供应商代码:全大写+下划线(GLS_ES)', isPrimary: true },
          { name: 'name',              type: 'varchar',                  comment: '服务商名称', isNullable:true},
          { name: 'accountAttribute',  type: 'json',                     comment: '服务商账号属性' },
          { name: 'maxInsuranceValue', type:'numeric',                   comment: '服务商保险最大金额', isNullable: true},
          { name: 'labelFormatsEnum',  type: 'json',                     comment: '服务商面单可选值', isNullable: true},
          { name: 'shipmentUrl',       type: 'json',                     comment: '下单URL' },
          { name: 'createdAt',         type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt',         type: 'timestamp with time zone', default: 'now()' },
        ],
      }), true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transporter',true)
  }
}
