import { Inject, Injectable } from '@nestjs/common';
import { TransporterZoneRepository } from '@/domain/sci/transporter-zone/repository/transporter-zone.repository';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TransporterZone } from '@/domain/sci/transporter-zone/entity/transporter-zone.entity';
import { InjectRepository } from '@nestjs/typeorm';
import _ from 'lodash';
import { CrudRequest } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { Transporter } from '@/domain/utils/Enums';

@Injectable()
export class TransporterZoneService extends TypeOrmCrudService<TransporterZone> {
  constructor(
    @Inject(TransporterZoneRepository) private readonly transporterZoneRepository: TransporterZoneRepository,
    private redisCacheNewService: RedisCacheNewService,
    @InjectRepository(TransporterZone) repo,
  ) {
    super(repo);
  }

  async createOne(req: CrudRequest, dto: DeepPartial<TransporterZone>) {
    const result = super.createOne(req, dto);
    await this.deleteCachePattern();
    return result;
  }

  async bulkCreate(cityPostalCodes: TransporterZone[]) {
    await this.transporterZoneRepository.bulkInsert(cityPostalCodes);
  }

  async replaceOne(req: CrudRequest, dto: DeepPartial<TransporterZone>) {
    const result = super.replaceOne(req, dto);
    await this.deleteCachePattern();
    return result;
  }

  async deleteOne(req: CrudRequest): Promise<void | TransporterZone> {
    const result = await super.deleteOne(req);
    await this.deleteCachePattern();
    return result;
  }

  async findAll(transporter: Transporter) {
    return await this.repo.find({
      where: {
        transporter,
      },
      order: {
        postalCode: 'ASC',
        city: 'ASC',
      },
      select: ['route', 'postalCode', 'city', 'active'],
    });
  }

  @Cacheable({ cacheKey: args => `CMS_ZONE_${args[1]}_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findByPostCode(postCode: string, route: any) {
    return super.find({
      postalCode: postCode,
      route,
      active: true,
    });
  }

  /**
   * 模糊匹配删除缓存
   * @private
   */
  async deleteCachePattern() {
    await this.redisCacheNewService.del(`CMS_ZONE_*`, true);
  }

  /**
   * oms 根据线路获取生效邮编
   * @param route
   * @param transporter
   */
  async findByRoute(route: string, transporter = 'COLISPRIVE') {
    const zoneList = await this.repo.find({
      where: {
        active: true,
        route,
        transporter,
      },
      select: ['postalCode'],
    });

    return _.map(zoneList, 'postalCode');
  }

  async bulkInsert(zoneArray) {
    return await this.transporterZoneRepository.bulkInsert(zoneArray);
  }

  async bulkUpdate(zoneArray, updateColumns: string[]) {
    return await this.transporterZoneRepository.bulkUpdate(zoneArray, updateColumns);
  }
}
