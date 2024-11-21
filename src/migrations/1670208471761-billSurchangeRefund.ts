import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billSurchargeRefund1670208471761 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      // 额外费赔付
      await queryRunner.createTable(new Table({
        name: 'bill_surcharge_refund',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'transporter', type: 'varchar', length: '50' },
          { name: 'month', type: 'varchar', length: '50' },
            { name: 'refund_type', type: 'varchar', length: '50' },
          { name: 'tracking_number', type: 'varchar', length: '255'},
          { name: 'surcharge_type', type: 'varchar', length: '50' },
          { name: 'surcharge', type: 'numeric', length: '10,2'},
          { name: 'expected_refund', type: 'numeric', length: '10,2'},
          { name: 'actual_refund', type: 'numeric', length: '10,2'},
          { name: 'actual_refund_file', type: 'varchar', length: '255',isNullable:true},
          { name: 'remaining_refund', type: 'numeric', length: '10,2'},
          { name: 'weight', type: 'numeric'},
          { name: 'length', type: 'varchar', length: '100', isNullable:true},
          { name: 'width',  type: 'varchar', length: '100',isNullable:true},
          { name: 'height',  type: 'varchar', length: '100',isNullable:true},
          { name: 'pic_url', type: 'varchar', length: '255',isNullable:true },
          { name: 'sorting_type', type: 'varchar', length: '50' ,isNullable:true},

        ],
      }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
