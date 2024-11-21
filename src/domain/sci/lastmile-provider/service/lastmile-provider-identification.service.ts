import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import 'moment-timezone';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { LastmileProviderIdentification } from '@/domain/sci/lastmile-provider/entity/lastmile-provider-identification.entity';
import { CrudRequest, Override } from '@nestjsx/crud';
import { DeepPartial } from 'typeorm';
import _ from 'lodash';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';

@Injectable()
export class LastmileProviderIdentificationService extends TypeOrmCrudService<LastmileProviderIdentification> {
  constructor(
    @InjectRepository(LastmileProviderIdentification) repo,

    private redisCacheNewService: RedisCacheNewService,
    private nacosRepository: NacosRepository,
  ) {
    super(repo);
  }

  async getAllProvider() {
    const providers = await this.repo.find();
    return _.chain(providers)
      .map('lastmileProvider')
      .uniq()
      .value();
  }

  @Cacheable({ cacheKey: 'LASTMILE_PROVIDER_IDENTIFICATION', ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findRedis() {
    return await this.repo.find();
  }

  @Override()
  async replaceOne(req: CrudRequest, dto: DeepPartial<LastmileProviderIdentification>) {
    await this.deleteCache();
    const result = await super.replaceOne(req, dto);
    await this.nacosRepository.setLastmileProviderIdentificationConfig();
    return result;
  }

  @Override()
  async createOne(
    req: CrudRequest,
    dto: DeepPartial<LastmileProviderIdentification>,
  ): Promise<LastmileProviderIdentification> {
    await this.deleteCache();
    const result = await super.createOne(req, dto);
    await this.nacosRepository.setLastmileProviderIdentificationConfig();
    return result;
  }

  @Override()
  async deleteOne(req: CrudRequest): Promise<void | LastmileProviderIdentification> {
    await this.deleteCache();
    await super.deleteOne(req);
    await this.nacosRepository.setLastmileProviderIdentificationConfig();
  }

  /**
   * 模糊匹配删除缓存
   * @private
   */
  private async deleteCache() {
    await this.redisCacheNewService.del('LASTMILE_PROVIDER_IDENTIFICATION', false);
  }

  /**
   * 根据单号识别配置获取尾程派送商
   * @param trackingNumber
   * @param identifications 识别配置
   */
  public getLastmileProvider(trackingNumber: any, identifications: LastmileProviderIdentification[]) {
    // 根据尾程识别配置找到 CMS_TRACK 对应的尾程派送商
    const identifySuccess = identifications.find(config => {
      // 有值校验，无值表示不校验
      let lengthLimitPass = true;
      let startWithPass = true;
      let endWithPass = true;
      let isLetterRequiredPass = true;

      if (config.lengthLimit.length) {
        lengthLimitPass = config.lengthLimit.includes(trackingNumber.length.toString());
      }
      if (config.startWith.length) {
        startWithPass = config.startWith.some(start => _.startsWith(trackingNumber, start));
      }
      if (config.endWith.length) {
        endWithPass = config.endWith.some(end => _.endsWith(trackingNumber, end));
      }
      if (config.isLetterRequired) {
        isLetterRequiredPass = /.*[a-zA-z].*/.test(trackingNumber);
      }
      return lengthLimitPass && startWithPass && endWithPass && isLetterRequiredPass;
    });
    return identifySuccess?.lastmileProvider;
  }
}
