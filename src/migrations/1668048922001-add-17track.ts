import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class add17track1668048922001 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    // 17track配置表
    await queryRunner.createTable(new Table({
      name: 'tracking_17track_config',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter_id', type: 'varchar', length: '50' },
        { name: 'application', type: 'varchar', length: '50' },
        { name: 'transporter_accounts', type: 'varchar',length:'200', isNullable: true },
        { name: 'account_17track', type: 'varchar', length: '50' },
        { name: 'password', type: 'varchar', length: '50' },
        { name: 'key', type: 'varchar', length: '50' },
        { name: 'operator', type: 'varchar', length: '20' },
        { name: 'enabled', type: 'bool' },
        { name: 'effected_at', type: 'timestamp with time zone', isNullable: true },
        // name: 'fetch_time', type: 'timestamp with time zone',isNullable:true
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    // 物流单号注册表
    await queryRunner.createTable(new Table({
      name: 'tracking_register',
      columns: [
        { name: 'id', type: 'int8', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'tracking_number', type: 'varchar',length: '50' },
        { name: 'platform', type: 'varchar', length: '20' },
        { name: 'registered_at', type: 'timestamp with time zone', isNullable: true },
        { name: 'stop_at', type: 'timestamp with time zone', isNullable: true },
        { name: 'retry_at', type: 'timestamp with time zone', isNullable: true },
        { name: 'is_stopped', type: 'bool' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UK_TRACKING_17TRACK_CONFIG_APPLICATION_TRANSPORTER_ID" ON "public"."tracking_17track_config" ("application","transporter_id");
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UK_TRACKING_REGISTER_TRACKING_NUMBER_PLATFORM" ON "public"."tracking_register" ("tracking_number","platform");
    `);

    // tracking_webhook_delivengo_log改名为tracking_webhook_log
    await queryRunner.query(`
      ALTER TABLE "tracking_webhook_delivengo_log" rename to "tracking_webhook_log"
    `);

    // tracking_webhook_log添加platform字段
    await queryRunner.query(`
      ALTER TABLE "public"."tracking_webhook_log"
        ADD COLUMN "platform" varchar(20);
    `);

    // tracking_webhook_log更新platform字段为DELIVENGO
    await queryRunner.query(`
      update tracking_webhook_log set platform='DELIVENGO' where platform is null
    `);

  }


  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop index "UK_TRACKING_REGISTER_TRACKING_NUMBER_PLATFORM"`);
    await queryRunner.query(`drop index "UK_TRACKING_17TRACK_CONFIG_APPLICATION_TRANSPORTER_ID"`);
    await queryRunner.dropTable(`tracking_register`, true);
    await queryRunner.dropTable(`tracking_17track_config`, true);
  }
}
