import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addTrackingFetchRecord1661137478513 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'tracking_fetch_record',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'tracking_number', type: 'varchar',length:'50' },
        { name: 'fetch_time', type: 'timestamp with time zone',isNullable:true },
        { name: 'status', type: 'char',length:'7' },
        { name: 'message', type: 'varchar',length:'1000',isNullable:true },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tracking_fetch_record');
  }

}
