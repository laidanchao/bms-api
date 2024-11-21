import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuantityDistributionRepository } from '@/domain/srs/quantity-distribution/repository/quantity-distribution.repository';
import _ from 'lodash';
import { QuantityDistribution } from '@/domain/srs/quantity-distribution/entities/quantity-distribution.entity';
import { ClsService } from 'nestjs-cls';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';

@Injectable()
export class QuantityDistributionService extends TypeOrmCrudService<QuantityDistribution> {
  constructor(
    @InjectRepository(QuantityDistributionRepository)
    private quantityDistributionRepository: QuantityDistributionRepository,
    private cls: ClsService,
    private magicBIService: MagicBIService,
    private redisCacheNewService: RedisCacheNewService,
  ) {
    super(quantityDistributionRepository);
  }

  async fetchAnalysisData(wheres: Record<string, string>) {
    const { data } = await this.magicBIService.getDataFromBI('statistics/getParcelStatistics', wheres);
    return data;
  }

  async fetchAnalysisMenu(keys: string[], platform = null) {
    const tree = await this.redisCacheNewService.get('PARCEL_STATISTICS_TREE');
    let data;
    if (tree) {
      data = JSON.parse(tree);
    } else {
      const result = await this.magicBIService.getDataFromBI('statistics/getParcelStatisticsTree', {});
      data = result.data;
      // 缓存保存24小时
      this.redisCacheNewService.set('PARCEL_STATISTICS_TREE', JSON.stringify(data), 3600 * 24).then();
    }

    if (platform) {
      data = data.filter(f => f.platform === platform);
    }

    if (!keys) {
      // 提供默认的树的结构
      keys = Object.keys(data[0]);
    }
    return toTree(data, keys);
  }

  async fetch6GAnalysisMenu(keys: string[]) {
    const treeDataRange = await this.quantityDistributionRepository.fetch6GAnalysisMenu();
    if (_.isEmpty(treeDataRange)) {
      return [];
    }
    if (!keys) {
      // 提供默认的树的结构
      keys = Object.keys(treeDataRange[0]);
    }
    return toTree(treeDataRange, keys);
  }

  async createOrCover(parcelQuantityArray) {
    return await this.quantityDistributionRepository.createOrCover(parcelQuantityArray);
  }

  async findByDateAndTransporterAndClientId(startOfMonth, endOfMonth, transporter, clientId) {
    return await this.quantityDistributionRepository.findByDateAndTransporterAndClientId(
      startOfMonth,
      endOfMonth,
      transporter,
      clientId,
    );
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
