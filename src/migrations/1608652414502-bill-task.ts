import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billTask1608652414502 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'billTask',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'month', type: 'varchar', comment: '账单月' },
        { name: 'billType', type: 'varchar' },
        { name: 'account', type: 'varchar' },
        { name: 'subAccount', type: 'json' },
        { name: 'billUrl', type: 'varchar' },
        { name: 'billAt', type: 'timestamp with time zone', default: 'now()' },
        { name: 'transporter', type: 'varchar' },
        { name: 'platform', type: 'varchar' },
        { name: 'status', type: 'varchar' },
        { name: 'result', type: 'json' },
        { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

  }

  public async down(): Promise<void> {
    // Nothing to do
  }

}
