import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { AverageParcelAging } from '@/domain/srs/average-parcel-aging/entities/average-parcel-aging.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AverageParcelAgingRepository } from '@/domain/srs/average-parcel-aging/repository/average-parcel-aging.repository';
import _ from 'lodash';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AverageParcelAgingService extends TypeOrmCrudService<AverageParcelAging> {
  constructor(
    @InjectRepository(AverageParcelAgingRepository)
    private readonly averageParcelAgingRepository: AverageParcelAgingRepository,
    private readonly cls: ClsService,
  ) {
    super(averageParcelAgingRepository);
  }

  async fetchAnalysisData(wheres: Record<string, string>) {
    return await this.averageParcelAgingRepository.fetchAnalysisData(wheres);
  }

  async fetchAnalysisMenu(keys: string[]) {
    const platform = this.cls.get('platform');
    const treeDataRange = await this.averageParcelAgingRepository.fetchAnalysisMenu(platform);
    if (_.isEmpty(treeDataRange)) {
      return [];
    }
    if (!keys) {
      // 提供默认的树的结构
      keys = Object.keys(treeDataRange[0]);
    }
    return toTree(treeDataRange, keys);
  }

  async createOrCover(averageParcelAgingArray) {
    return await this.averageParcelAgingRepository.createOrCover(averageParcelAgingArray);
  }
}

function toTree(array, keys: string[]) {
  if (keys.length === 0) {
    return [];
  }
  const key = keys[0];
  return _.chain(array)
    .groupBy(key)
    .map((group, label) => {
      return {
        key: key,
        label: label,
        children: toTree(group, keys.slice(1)),
      };
    })
    .value();
}
