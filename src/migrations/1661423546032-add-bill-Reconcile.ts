import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addBillReconcile1661423546032 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'bill_reconcile',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter_id', type: 'varchar', length: '50' },
        { name: 'file_path', type: 'varchar', length: '100', isNullable: true },
        { name: 'file_url', type: 'varchar', length: '100', isNullable: true },
        { name: 'month', type: 'char', length: '7' },
        { name: 'product_codes', type: 'varchar', length: '50' },
        { name: 'payable_shipping_fee', type: 'numeric', isNullable: true },
        { name: 'payable_fuel_fee', type: 'numeric', isNullable: true },
        { name: 'actual_shipping_fee', type: 'numeric', isNullable: true },
        { name: 'actual_fuel_fee', type: 'numeric', isNullable: true },
        { name: 'total', type: 'int' },
        { name: 'success', type: 'int' },
        { name: 'failed', type: 'int' },
        { name: 'is_finished', type: 'bool' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'bill_reconcile_detail',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'bill_reconcile_id', type: 'int' },
        { name: 'transporter_account_id', type: 'varchar', length: '50' },
        { name: 'product_code', type: 'varchar', length: '50', isNullable: true },
        { name: 'country_code', type: 'varchar', length: '50', isNullable: true },
        { name: 'weight_range', type: 'numeric' },
        { name: 'parcel_quantity', type: 'int' },
        { name: 'unit_price', type: 'numeric', isNullable: true },
        { name: 'payable_shipping_fee', type: 'numeric', isNullable: true },
        { name: 'payable_fuel_fee', type: 'numeric', isNullable: true },
        { name: 'actual_shipping_fee', type: 'numeric', isNullable: true },
        { name: 'actual_fuel_fee', type: 'numeric', isNullable: true },
        { name: 'is_error', type: 'bool' },
        { name: 'line_number', type: 'int' },
        { name: 'error_message', type: 'varchar', length: '255', isNullable: true },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'bill_cost_price',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter_id', type: 'varchar', length: '50' },
        { name: 'product_codes', type: 'varchar', length: '50' },
        { name: 'zones', type: 'varchar', length: '50' },
        { name: 'weight_range', type: 'numeric' },
        { name: 'unit_price', type: 'numeric' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bill_reconcile');
    await queryRunner.dropTable('bill_reconcile_detail');
    await queryRunner.dropTable('bill_cost_price');
  }

}
