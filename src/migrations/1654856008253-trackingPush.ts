import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class trackingPush1654856008253 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'tracking_push',
        columns:[
          { name: 'id',              type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'tracking_number', type: 'varchar' },
          { name: 'event_code',      type: 'varchar' },
          { name: 'event_time',      type: 'timestamp with time zone' },
          { name: 'status',          type: 'varchar', default:"'NOT_PUSHED'" },
          { name: 'created_at',       type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at',       type: 'timestamp with time zone', default: 'now()' },
        ]
      }),true);

      await queryRunner.createTable(new Table({
        name: 'tracking_push_log',
        columns:[
          { name: 'id',                type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'file_path',         type: 'varchar' },
          { name: 'tracking_push_ids', type: 'varchar' },
          { name: 'created_at',  type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at',  type: 'timestamp with time zone', default: 'now()' },
        ]
      }),true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      // do nothing
    }

}
