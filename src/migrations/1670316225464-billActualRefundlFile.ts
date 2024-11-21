import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billActualRefundlFile1670316225464 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      // 额外费赔付
      await queryRunner.createTable(new Table({
        name: 'bill_actual_refund_file',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'file_url', type: 'varchar', length: '255',isNullable:true},
          { name: 'file_path', type: 'varchar', length: '255'},
          { name: 'operator', type: 'varchar', length: '100'}
        ],
      }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
