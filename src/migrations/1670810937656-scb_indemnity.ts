import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class scbIndemnity1670810937656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'clm_monthly_indemnity',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'month', type: 'varchar', length: '50' },
          { name: 'transporter', type: 'varchar', length: '50' },
          { name: 'transporter_account_id', type: 'varchar', length: '255'},
          { name: 'refund_type', type: 'varchar', length: '50' },
          { name: 'shipping_fee_after_discount', type: 'numeric', length: '10,2'},
          { name: 'expected_indemnity', type: 'numeric', length: '10,2'},
          { name: 'actual_overtime_indemnity', type: 'numeric', length: '10,2', isNullable: true},
          { name: 'actual_lost_indemnity', type: 'numeric', length: '10,2', isNullable: true},
          { name: 'difference', type: 'numeric', length: '10,2',isNullable:true},
          { name: 'operator',  type: 'varchar', length: '100',isNullable:true},
        ],
      }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
