import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class addSciTransporterApi1684115634302 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'sci_transporter_api',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'transporter', type: 'varchar', length: '50' },
        { name: 'api_url', type: 'varchar', length: '200' },
        { name: 'enabled', type: 'bool' },
        { name: 'operator', type: 'varchar', length: '50' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
      ],
    }), true);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UK_SCI_TRANSPORTER_API_TRANSPORTER" ON "public"."sci_transporter_api" ("transporter");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }

}
