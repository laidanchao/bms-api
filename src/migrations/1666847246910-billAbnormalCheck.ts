import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billAbnormalCheck1666847246910 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'bill_extra_fee_check',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'transporter_id', type: 'varchar', length: '50' },
          { name: 'month', type: 'varchar', length: '50' },
          { name: 'account_ids', type: 'varchar', length: '255'},
          { name: 'extra_fee', type: 'numeric', length: '10,2'},
          { name: 'repeat_count', type: 'int',isNullable:true },
          { name: 'file_path', type: 'varchar', length: '255',isNullable:true },
          { name: 'file_url', type: 'varchar', length: '255',isNullable:true },
          { name: 'is_finished', type: 'bool', default: "'f'" },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }), true);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable(`bill_extra_fee_check`, true);
    }

}
