import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billTaskTemplate1608652439815 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'billTaskTemplate',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'platform', type: 'varchar' },
        { name: 'transporter', type: 'varchar', comment: '供应商' },
        { name: 'account', type: 'varchar' },
        { name: 'subAccount', type: 'varchar' },
        { name: 'billType', type: 'varchar' },
        { name: 'dateType', type: 'varchar', comment: '自然周/月' },
        { name: 'checkList', type: 'varchar', comment: '校验特征' },
        { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);
  }

  public async down(): Promise<void> {
    // Nothing to do
  }

}
