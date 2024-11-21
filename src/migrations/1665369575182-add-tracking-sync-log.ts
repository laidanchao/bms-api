import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addTrackingSyncLog1665369575182 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 轨迹推送日志表
    await queryRunner.createTable(new Table({
      name: 'tracking_sync_log',
      columns: [
        { name: 'id', type: 'int8', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter_id', type: 'varchar', length: '50' },
        { name: 'application', type: 'varchar', length: '50' },
        { name: 'client_id', type: 'varchar', length: '50', isNullable: true },
        { name: 'status', type: 'varchar', length: '10' },
        { name: 'tracking_number', type: 'varchar' },
        { name: 'event', type: 'varchar', length: '50' },
        { name: 'timestamp', type: 'timestamp with time zone' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'location', type: 'varchar', length: '255', isNullable: true },
        { name: 'from_file', type: 'bool' },
        { name: 'file_name', type: 'varchar', length: '255', isNullable: true },
        { name: 'tracking_id', type: 'int8', isUnique: true },
        { name: 'reference', type: 'varchar', length: '50', isNullable: true  },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);


    // 轨迹推送配置表
    await queryRunner.createTable(new Table({
      name: 'tracking_sync_config',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter_ids', type: 'varchar', length: '200' },
        { name: 'application', type: 'varchar', length: '50' },
        { name: 'client_id', type: 'varchar', length: '50', default:"''" },
        { name: 'enabled', type: 'bool' },
        { name: 'operator', type: 'varchar', length: '50' },
        { name: 'kafka_topic', type: 'varchar', length: '50' },
        { name: 'warning_limit', type: 'int', isNullable: true },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UK_TRACKING_SYCN_CONFIG_APPLICATION_CLIENTID" ON "public"."tracking_sync_config" ("application","client_id");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index "UK_TRACKING_SYCN_CONFIG_APPLICATION_CLIENTID"`);
    await queryRunner.dropTable(`tracking_sync_log`, true);
    await queryRunner.dropTable(` tracking_sync_config`, true);
  }

}
