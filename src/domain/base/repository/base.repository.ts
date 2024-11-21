import { EntityManager, getConnection, Repository, Transaction, TransactionManager } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';

// interface BulkUpdateOptions {
//   tableName: string;
//   whereColumns: string[];
//   updateColumns: string[] | string;
// }

@Injectable()
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  // TODO weifeng 这里真的很烦, 为什么批量插入数据一旦多, 就会报参数错误!
  async bulkInsert(data: Entity[] | Entity) {
    const chunk = _.chunk(data, 1000);
    let result = [];
    for (const data of chunk) {
      const insertResult = await this.createQueryBuilder()
        .insert()
        .into(this.metadata.tableName)
        .values(data)
        .orIgnore()
        // .returning(columnDatabaseNames)
        .execute();
      result = result.concat(insertResult.identifiers);
    }
    return result;
  }

  async destroy(where: any) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(this.metadata.tableName)
      .where(where)
      .execute();
  }

  @Transaction()
  async destroyAndCreate(where: any, data: Entity[], @TransactionManager() manager?: EntityManager) {
    await manager
      .createQueryBuilder()
      .delete()
      .from(this.metadata.tableName)
      .where(where)
      .execute();
    const insertResult = await manager
      .createQueryBuilder()
      .createQueryBuilder()
      .insert()
      .into(this.metadata.tableName)
      .values(data)
      .onConflict('DO_NOTHING')
      .execute();
    return insertResult.identifiers;
  }

  // @Transaction()
  // async bulkUpdateOld(dataSet: Entity[], options: BulkUpdateOptions, @TransactionManager() manager?: EntityManager) {
  //   for (const chunkDataSet of _.chunk(dataSet, 1000)) {
  //     if (!options.updateColumns || !options.updateColumns.length) {
  //       return 'updateColumns required !';
  //     }
  //     if (!options.whereColumns) {
  //       return 'whereColumns required !';
  //     }
  //     if (chunkDataSet && chunkDataSet.length) {
  //       const tempTableName = `"${this.metadata.tableName}_temp"`;
  //       const targetTableName = `"${this.metadata.tableName}"`;
  //
  //       // execute some operations on this transaction:
  //       await manager.query(
  //         `create TEMP table if not exists ${tempTableName}  ON COMMIT DROP AS SELECT * FROM ${targetTableName} WHERE 1=2;\n`,
  //       );
  //       const repository = manager.getRepository(this.metadata.targetName);
  //       const databaseColumns = repository.metadata.columns;
  //       const databaseColumnNames = databaseColumns.map(column => column.databaseName);
  //       const updateColNames = this.mapDatabaseColumnName(options.updateColumns, databaseColumns);
  //       const whereColNames = this.mapDatabaseColumnName(options.whereColumns, databaseColumns);
  //       // TODO weifeng 这里真的很烦, 为什么批量插入数据一旦多, 就会报参数错误!
  //       await repository
  //         .createQueryBuilder()
  //         .insert()
  //         .into(tempTableName.replace(/\"/g, ''), databaseColumnNames)
  //         .values(chunkDataSet)
  //         .onConflict('DO NOTHING')
  //         .execute();
  //
  //       const setColumnRawSql = _.map(
  //         updateColNames,
  //         updateColumn => `\"${updateColumn}\" = ${tempTableName}.\"${updateColumn}\"`,
  //       ).join(', ');
  //       const whereRawSql = whereColNames
  //         .map(whereColumn => `${targetTableName}.\"${whereColumn}\" = ${tempTableName}.\"${whereColumn}\"`)
  //         .join(' and ');
  //       const bulkUpdateRawSql = `UPDATE ${targetTableName} set ${setColumnRawSql} from ${tempTableName} \n WHERE ${whereRawSql};`;
  //       await manager.query(bulkUpdateRawSql);
  //     }
  //   }
  // }

  /**
   * 批量更新数据
   * @param dataSet 完整的entity（需要先find出来，并替换掉需要更新的数据）
   * @param updateColumns 需要更新的字段名数组
   * @param manager
   */
  @Transaction()
  async bulkUpdate(dataSet: Entity[], updateColumns: string[], @TransactionManager() manager?: EntityManager) {
    if (_.isEmpty(dataSet)) {
      return;
    }

    const repository = manager.getRepository(this.metadata.targetName);
    const { tableName, columns } = repository.metadata;
    const allColNames = columns.map(column => column.propertyName);
    const updateColNames = this.mapDatabaseColumnName(updateColumns, columns);

    const updateStr = updateColNames
      .map(m => {
        return `${m} = excluded.${m}`;
      })
      .join(',');

    for (const chunkDataSet of _.chunk(dataSet, 1000)) {
      await repository
        .createQueryBuilder()
        .insert()
        .into(tableName, allColNames)
        .values(chunkDataSet)
        .onConflict(`(id) DO UPDATE SET ${updateStr}`)
        .execute();
    }
  }

  async findOrBuild(where: any, defaults: any): Promise<Entity> {
    // TODO weifeng step4 这里getConnection()方法会报错
    const entity = await getConnection()
      .createQueryBuilder(this.metadata.tableName, 'alias')
      .where(where)
      .getOne();
    return entity || _.defaults({}, defaults);
  }

  async updateOrInsert(data: Entity, @TransactionManager() manager?: EntityManager) {
    return manager.getRepository(this.metadata.tableName).save(data);
  }

  private mapDatabaseColumnName(columns, databaseColumns): string[] {
    return _.map(columns, col => {
      const found = _.find(databaseColumns, column => column.propertyName === col);
      if (!found) {
        throw new Error(`${col} field is not exist in ${this.metadata.tableName} table`);
      }
      return found.databaseName;
    });
  }
}
