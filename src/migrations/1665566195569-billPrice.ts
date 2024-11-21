import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class billPrice1665566195569 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'bill_extra_fee_price',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'month', type: 'varchar', length: '50' },
          { name: 'transporter', type: 'varchar', length: '50' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'country_code', type: 'varchar', length: '50' },
          { name: 'value', type: 'numeric', length: '10,2' },
          { name: 'is_deleted', type: 'bool', default: "'f'" },
          { name: 'comment', type: 'varchar',  length: '255', isNullable: true },
          { name: 'operator', type: 'varchar', length: '100' },
          { name: 'deleted_at', type: 'timestamp with time zone', isNullable: true},
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }), true);

      await queryRunner.query(` ALTER TABLE "public"."bill_fuel_rate" ADD COLUMN "is_deleted" bool  DEFAULT 'f';`)
      await queryRunner.query(` ALTER TABLE "public"."bill_fuel_rate" ADD COLUMN "deleted_at" timestamptz(6);`)
      await queryRunner.query(` ALTER TABLE "public"."bill_fuel_rate" ADD COLUMN "operator" varchar(100);`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable(`bill_extra_fee_price`, true);
      await queryRunner.query(`
        ALTER TABLE "public"."bill_fuel_rate" DROP COLUMN "is_deleted"
        ALTER TABLE "public"."bill_fuel_rate" DROP COLUMN "deleted_at"
        ALTER TABLE "public"."bill_fuel_rate" DROP COLUMN "operator"
      `)
    }

}
