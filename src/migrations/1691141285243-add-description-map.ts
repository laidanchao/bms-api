import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class addDescriptionMap1691141285243 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

      await queryRunner.createTable(new Table({
        name: 'sct_description_map',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'transporter', type: 'varchar', length: '50' },
          { name: 'code', type: 'varchar', length: '50' },
          { name: 'description', type: 'varchar' },
          { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
        ],
      }), true);

      await queryRunner.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "UK_sct_description_map_code" ON "public"."sct_description_map" ("code");
      `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
