import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class operationLog1608210977132 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: 'operationLog',
        columns:[
          { name: 'id',        type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'method',    type: 'varchar' },
          { name: 'operation', type: 'varchar'},
          { name: 'entity',    type: 'varchar'},
          { name: 'operator',  type: 'varchar'},
          { name: 'entityId',  type: 'varchar'},
          { name: 'oldEntity', type: 'json',    isNullable:true},
          { name: 'newEntity', type: 'json'},
          { name: 'createdAt', type: 'timestamp with time zone', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'now()' },
        ]
      }),true)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('operationLog',true)
    }

}
