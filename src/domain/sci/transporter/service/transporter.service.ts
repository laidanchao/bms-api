import { CreateLabelFormatDto } from '@/domain/sci/transporter/dto/create-label-format.dto';
import { CreateTransporterAccountDto } from '@/domain/sci/transporter/dto/create-transporter-account.dto';
import { LabelFormat } from '@/domain/sci/transporter/entities/label-format.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { TransporterRepository } from '@/domain/sci/transporter/transporter.repository';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import _ from 'lodash';
import 'moment-timezone';
import { Cacheable, CacheClear } from 'type-cacheable';
import { Like, Repository } from 'typeorm';
import { TransporterProduct } from '@/domain/sci/transporter/entities/transporter-product.entity';
import { Transporter } from '@/domain/sci/transporter/entities/transporter.entity';
import { AwsService } from '@/domain/external/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '@/app/exception/business-exception';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
@Injectable()
export class TransporterService extends TypeOrmCrudService<Transporter> {
  constructor(
    @InjectRepository(Transporter) repo,
    @InjectRepository(TransporterRepository) private transRepo: TransporterRepository,
    @InjectRepository(Account) private transporterAccountRepo: Repository<Account>,
    @InjectRepository(LabelFormat) private labelFormatRepo: Repository<LabelFormat>,
    @InjectRepository(TransporterProduct) private transporterRouteRepo: Repository<TransporterProduct>,
    private redisCacheNewService: RedisCacheNewService,
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
    private nacosRepository: NacosRepository,
  ) {
    super(repo);
  }

  getProductCode(ftlRoute) {
    return this.transRepo.getProductCodeByRoute(ftlRoute);
  }

  getProduct() {
    return this.transRepo.getProduct();
  }

  getAccount({ s }) {
    let where;
    if (s) {
      const conditions = JSON.parse(s);
      where = { ...conditions };

      if (_.has(conditions, 'operator')) {
        const operatorStr = conditions['operator']['$contL'];
        where.operator = Like(`%${operatorStr}%`);
      }
      // 默认只展示启用的
      if (!_.has(where, 'enabled')) {
        where['enabled'] = true;
      }
    } else {
      where = { enabled: true };
    }

    return this.transporterAccountRepo.find({ where, order: { id: 'ASC' } });
  }

  getLabelFormats({ s }) {
    let where;
    if (s) {
      const conditions = JSON.parse(s);
      where = { ...conditions };
      where = this._getContLQuery(conditions, where, 'operator');
      where = this._getContLQuery(conditions, where, 'labelSize');
      where = this._getContLQuery(conditions, where, 'labelType');
    }
    return this.labelFormatRepo.find(where);
  }
  _getContLQuery(conditions, where, key) {
    if (_.has(conditions, key)) {
      const val = conditions[key].$contL;
      where[key] = Like(`%${val}%`);
    }
    return where;
  }

  @CacheClear({ cacheKey: 'CMS', isPattern: true })
  async saveProduct(product) {
    const result = await this.transporterRouteRepo.save(product);
    await this.nacosRepository.setProductConfig();
    return result;
  }

  getMany(req) {
    return super.getMany(req);
  }

  @CacheClear({ cacheKey: 'CMS', isPattern: true })
  async saveAccount(account: CreateTransporterAccountDto) {
    if (!account.clientId) {
      account.clientId = null;
    }
    const result = await this.transporterAccountRepo.save(account);
    await this.nacosRepository.setAccountConfig();
    return result;
  }

  @CacheClear({ cacheKey: 'CMS', isPattern: true })
  async saveLabelFormat(labelFormat: CreateLabelFormatDto) {
    const result = await this.labelFormatRepo.save(labelFormat);
    await this.nacosRepository.setLabelFormatConfig();
    return result;
  }

  @CacheClear({ cacheKey: 'CMS', isPattern: true })
  async replaceOne(req, dto) {
    return super.replaceOne(req, dto);
  }

  async getSignedLabelExampleUrl(id) {
    const labelFormat = await this.labelFormatRepo.findOne({ where: { id: id } });
    if (labelFormat && labelFormat.exampleUrl) {
      return this.awsService.getSignedUrl(labelFormat.exampleUrl, this.configService.get('Bucket').cms, 60);
    } else {
      throw new BusinessException('找不到面单示例');
    }
  }

  async findTransporterAccount(options) {
    return await this.transporterAccountRepo.findOne(options);
  }

  @Cacheable({ cacheKey: args => `TRANSPORTER_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findTransporterRedis(transporter: string) {
    return await this.repo.findOne({ id: transporter });
  }

  /**
   * 更新派送商数据
   * @param body
   */
  async updateTransporter(body) {
    const { id, maxInsuranceValue, lastmileProvider, lastmileProviderType, carrierCode17track } = body;
    await this.repo.update({ id }, { maxInsuranceValue, lastmileProvider, lastmileProviderType, carrierCode17track });
    await this.deleteCachePattern(id);
    await this.nacosRepository.setTransporterConfig();
    return;
  }

  /**
   * 新增派送商
   * @param body
   */
  async saveTransporter(body) {
    const { id, maxInsuranceValue, lastmileProvider, lastmileProviderType, carrierCode17track } = body;
    await this.repo.save({
      id,
      name: id,
      maxInsuranceValue,
      lastmileProvider,
      lastmileProviderType,
      carrierCode17track,
      accountAttribute: [],
    });
    await this.nacosRepository.setTransporterConfig();
    return;
  }

  /**
   * 模糊匹配删除缓存
   * @private
   */
  private async deleteCachePattern(transporter) {
    await this.redisCacheNewService.del(`TRANSPORTER_${transporter}`, false);
  }

  /**
   * oms 获取所有尾程派送商
   */
  async getLastmileProviders() {
    const transporterList = await this.repo.find({
      select: ['lastmileProvider'],
    });
    return _.chain(transporterList)
      .map('lastmileProvider')
      .uniq()
      .value();
  }
}
