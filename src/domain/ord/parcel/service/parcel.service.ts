import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  CancelParcelDto,
  CreateMultiParcelResponse,
  CreateParcelDto,
  CreateParcelResponse,
  QueryTrackingDto,
  UploadEtdFileDto,
} from '@/domain/ord/parcel/dto';
import { Between, getConnection, getRepository, In, MoreThan, Repository } from 'typeorm';
import _ from 'lodash';
import * as PDFUtils from '@ftlab/pdf-utils';
import { IChannelConfig } from '@/domain/ord/parcel/dto/i-channel-config';
import { ParcelCreateValidationService } from '@/domain/ord/parcel/service/parcel-create-validation.service';
import { RequestLog } from '@/domain/ord/request-log/entity/request-log.entity';
import { CreatePickupDto } from '@/domain/ord/parcel/dto/create-pickup.dto';
import { BusinessException } from '@/app/exception/business-exception';
import { Cacheable, CacheClear } from 'type-cacheable';
import { ShipmentInfoDto } from '@/domain/ord/parcel/dto/shipment-info.dto';
import moment from 'moment';
import { TransporterBrokerFactory } from '@/domain/sci/transporter/broker/transporter-broker-factory';
import { AwsService } from '@/domain/external/aws/aws.service';
import { SyncParcelInfoDto } from '@/domain/ord/parcel/dto/sync-parcel-info.dto';
import { OutsideParcelDto } from '../dto/outside-parcel.dto';
import { RelayPointDTO } from '@/domain/sci/transporter/broker/mr/mr.constraint';
import { ParcelColissimoService } from './parcel-colissimo.service';
import { RedisCacheNewService } from '@/domain/external/cache/redisCacheNew.service';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { EventService } from '@/domain/sct/core/service/event.service';
import { BillDetail } from '@/domain/scb/bill/entity/bill-detail.entity';
import { pageParamsType } from '@/application/ord/parcel.controller';
import { ConfigService } from '@nestjs/config';
import { trackingSort } from '@/domain/sct/core/service/tracking-handler.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@/app/logger';
import { TrackingNumberPool } from '@/domain/ord/parcel/entity/trackingNumberPool.entity';
import { SmsService } from '@/domain/external/sms/sms.service';
import { removeAccents } from '@/domain/utils/util';
import { ParcelLabel } from '@/domain/ord/parcel/entity/parcel-label.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { ParcelAll } from '@/domain/ord/parcel/entity/parcel-all.entity';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { KafkaProducer } from '@/domain/external/kafka/kafka.producer';
import { PlatformService } from '@/domain/base/ssm/platform/platform.service';
import { LastmileProviderTypeEnum } from '@/domain/sci/transporter/enum/lastmileProviderType.enum';
import { LastmileProviderMapEnum } from '@/domain/sci/transporter/enum/lastmileProviderMap.enum';
import { LastmileProviderIdentificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-identification.service';
import { ParcelAddressRestrictionService } from '@/domain/ord/parcel/service/parcel-address-restriction.service';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { TransporterApi } from '@/domain/sci/transporter/entities/transporter-api.entity';
import { RequestStatusEnum } from '@/domain/ord/request-log/enum/requestStatus.enum';

@Injectable()
export class ParcelService extends TypeOrmCrudService<Parcel> {
  private saveRequestLog: any;
  constructor(
    @InjectRepository(Parcel) repo,
    @InjectRepository(RequestLog) private requestLogRepository: Repository<RequestLog>,
    @Inject(AwsService) private awsService: AwsService,
    @Inject(ParcelCreateValidationService) private parcelCreateValidationService: ParcelCreateValidationService,
    @Inject(TransporterBrokerFactory) private transporterBrokerFactory: TransporterBrokerFactory,
    @Inject(ParcelColissimoService) private parcelColissimoService: ParcelColissimoService,
    @Inject(ParcelAddressRestrictionService)
    private parcelAddressRestrictionService: ParcelAddressRestrictionService,
    @Inject(EventService) private trackingEventService: EventService,
    @Inject(RedisCacheNewService) private redisCacheNewService: RedisCacheNewService,
    private readonly configService: ConfigService,
    private readonly smsService: SmsService,
    @InjectQueue('SHIPMENT_UPLOAD_LABEL') private shipmentUploadLabel: Queue,
    @InjectQueue('SHIPMENT_UPLOAD_INVOICE') private shipmentUploadInvoice: Queue,
    private readonly xPushService: XPushService,
    private readonly platformService: PlatformService,
    private readonly lastmileProviderIdentificationService: LastmileProviderIdentificationService,
    private readonly nacosRepository: NacosRepository,
  ) {
    super(repo);
    this.saveRequestLog = process.env.SAVE_REQUEST_LOG === 'true';
  }

  /**
   * 清空所有redis的缓存
   */
  async clearAllCache() {
    await this.redisCacheNewService.flushDb();
    return 'success';
  }

  async setNacosConfig() {
    await this.nacosRepository.setAllConfig();
    return 'success';
  }

  async getLabel(
    transport: string,
    trackingNumber: string,
    account: Record<any, any>,
    labelFormat: Record<any, any>,
  ): Promise<string> {
    const transporterClient = this._getClient(transport);
    return transporterClient.getLabel({ trackingNumber, account, labelFormat });
  }

  async searchRelayPointLocation(relayPointDTO: RelayPointDTO) {
    // todo delete applicationToPlatform
    relayPointDTO.platform = relayPointDTO?.platform || relayPointDTO?.application;
    const config: IChannelConfig = await this._getChannelConfig({ code: relayPointDTO.channel });
    // 判断是否是用客户账号下单，是-则替换相关账户信息
    if (config.isClientAccount) {
      config.accountInfo = relayPointDTO.accountInfo;
    }
    this.parcelCreateValidationService.validateChannelSetting(config, { platform: relayPointDTO.platform });
    const client = this._getClient(config.transporterId);
    return await client.searchRelayPointLocation(relayPointDTO, config);
  }

  /**
   *
   * @param req 主要拿请求头信息
   * @param dto 平台传过来的body参数
   */
  async create(req, dto: CreateParcelDto): Promise<CreateMultiParcelResponse> {
    return await this.createParcel(dto);
  }

  async createCn(req, dto: CreateParcelDto): Promise<CreateMultiParcelResponse> {
    const startTime = new Date().getTime();
    const result: CreateMultiParcelResponse = await this.createParcel(dto);
    const endTime = new Date().getTime();
    Logger.info(`parcel create duration: ${(endTime - startTime) / 1000} s`);
    if (result.parcelId) {
      await this.shipmentUploadLabel.add({ result, options: dto.options }, { removeOnComplete: true });
      await this.shipmentUploadInvoice.add({ result, options: dto.options }, { removeOnComplete: true });
    }

    return result;
  }

  async createParcel(dto: CreateParcelDto) {
    // todo delete applicationToPlatform
    dto.platform = dto?.platform || dto?.application;
    const startDateTime = moment().toDate();
    const originalDto = _.cloneDeep(dto);
    const config: IChannelConfig = await this._getChannelConfig(dto);
    try {
      // 判断是否是用客户账号下单，是-则替换相关账户信息
      if (config.isClientAccount) {
        config.accountInfo = dto.accountInfo;
      }

      // oms 是否使用默认寄件人地址
      if (dto.options.useSenderAddress) {
        const senderAddressConfig = this.nacosRepository.getSenderAddressConfig();
        const senderAddress = senderAddressConfig.find(
          (it: { addressCode: string }) => it.addressCode === config.senderAddressCode,
        );
        if (!senderAddress) {
          throw new BadRequestException(
            "FTL: 该渠道无默认寄件人配置，请联系管理员。There's no sender address for this channel. Please contact the administrator.",
          );
        }
        dto.senderAddress = _.pick(senderAddress, [
          'company',
          'email',
          'mobileNumber',
          'province',
          'street1',
          'street2',
          'street3',
          'city',
          'countryCode',
          'phoneNumber',
          'postalCode',
          'lastName',
          'firstName',
        ]);
      }

      config.labelFormat = config.labelFormats.find(label => label.code === dto.labelFormat);

      //验证渠道信息
      this.parcelCreateValidationService.validateChannel({ config, dto });

      // 去音标
      dto.senderAddress.firstName = removeAccents(dto.senderAddress?.firstName || '');
      dto.senderAddress.lastName = removeAccents(dto.senderAddress?.lastName || '');
      dto.senderAddress.company = removeAccents(dto.senderAddress?.company || '');

      dto.receiverAddress.firstName = removeAccents(dto.receiverAddress?.firstName || '');
      dto.receiverAddress.lastName = removeAccents(dto.receiverAddress?.lastName || '');
      dto.receiverAddress.company = removeAccents(dto.receiverAddress?.company || '');

      // @xiewenzhen 单元测试 mock这个方法, 闫涛会在12月22日当周或者下周完成mock
      const client = this._getClient(config.transporterId);

      // colissimo和菜鸟进行特殊处理和校验
      let colissimoHub;
      if (['COLISSIMO', 'CAINIAO'].includes(config.transporterId)) {
        // 针对8R退件需要交换寄收件地址 esd会自己转换地址
        if (dto.options.swapAddress !== false && config.productCode === 'CORE' && config.platform === 'FTL-OMS') {
          dto.options.swapAddress = true;
        }
        if (dto.options.swapAddress) {
          const { senderAddress, receiverAddress } = dto;
          dto.senderAddress = receiverAddress;
          dto.receiverAddress = senderAddress;
          if (_.isEmpty(dto.receiverAddress.company)) {
            throw new BusinessException('退件请填写receiverAddress.company');
          }
        }
        if ('FR' === dto.receiverAddress.countryCode) {
          await this.parcelColissimoService.validate(dto);
        }
      }

      // 收件规则校验
      await this.parcelAddressRestrictionService.validate(dto, config);

      let result: CreateParcelResponse | CreateParcelResponse[];
      try {
        result = await client.create(dto, config);
      } catch (e) {
        throw e;
      }
      const elapsedTime = moment().diff(startDateTime);
      // TODO transaction
      // TODO 记录异常请求:客户发给cms的请求,cms发给服务商的. 要有标识符可以查找
      let data;

      // 识别尾程派送商配置
      const identificationsConfig = this.nacosRepository.getLastmileProvider();
      const transporterConfig = this.nacosRepository.getTransporterConfig(config.transporterId);

      if ('trackingNumber' in result) {
        // 单包裹获取尾程派送商
        const { trackingNumber, lastmileProviderTrackingNumber, lastmileProviderMapKey } = result;
        const lastmileProvider = this._getParcelLastmileProvider(
          trackingNumber,
          transporterConfig,
          identificationsConfig,
          lastmileProviderTrackingNumber,
          lastmileProviderMapKey,
        );

        data = this._buildParcelData({ ...config, ...dto, ...result, lastmileProvider });
        if (
          'COLISSIMO' === config.transporterId &&
          (result.trackingNumber.startsWith('6A') || result.trackingNumber.startsWith('9V'))
        ) {
          data.hubCode = colissimoHub?.hubCode || 'LTH1';
          result.sortCode = colissimoHub?.hubCode || 'LTH1';
        } else {
          data.hubCode = colissimoHub?.hubCode || result.sortCode;
          result.sortCode = result.sortCode || colissimoHub?.hubCode;
        }
        if (this.saveRequestLog) {
          await this.requestLogRepository.save({
            trackingNumber: result.trackingNumber,
            transporterRequest: result.transporterRequest, //发给服务商的请求
            transporterResponse: result.transporterResponse, //服务商返回
            requestBody: JSON.stringify(originalDto), //平台发给cms
            transporter: config.transporterId,
            status: RequestStatusEnum.SUCCESS,
            clientId: dto.clientId,
            platform: dto.platform,
            channel: dto.code,
            clientReference: dto?.parcel?.reference,
            applicationRequest: dto.options?.applicationRequest,
            traceId: dto.options?.traceId,
            elapsedTime,
          });
        }

        // 不返回服务商请求
        const response = _.omit(result, ['transporterRequest', 'transporterResponse']);
        response.lastmileProvider = lastmileProvider;
        // 保存包裹、添加单号池
        const [saveResult] = await this.saveParcel([data]);

        const { smsProductCode } = this.platformService.getSmsProduct(dto.platform, config.transporterId);
        if (smsProductCode) {
          // 异步推送分拣包裹给SMS
          this.smsService
            .pushSortingParcelBatch(smsProductCode, [
              {
                trackingNumber,
                transporter: config.transporterId,
                postalCode: dto.receiverAddress.postalCode,
                clientId: dto.clientId,
                platform: dto.platform,
                waybillNumber: result.waybillNumber,
                barcode: result.barCode,
              },
            ])
            .catch(reason => {
              if (process.env.NODE_ENV.includes('production')) {
                this.xPushService.sendDingDing(`推送SMS包裹(${trackingNumber})失败：${reason}`);
              }
            });
        }

        return {
          parcels: [response],
          transporter: config.transporterId,
          client: dto.clientId,
          platform: dto.platform,
          trackingNumber,
          receiverPostalCode: dto.receiverAddress.postalCode,
          lastmileProvider,
          parcelId: saveResult.id,
          barCode: result.barCode,
          senderAddress: dto.options.useSenderAddress ? dto.senderAddress : null,
        };
      } else {
        //多包裹,按照包裹数组顺序返回

        data = (result as CreateParcelResponse[]).map((item, index) => {
          // 多包裹获取尾程派送商
          const { trackingNumber, lastmileProviderTrackingNumber, lastmileProviderMapKey } = item;
          item.lastmileProvider = this._getParcelLastmileProvider(
            trackingNumber,
            transporterConfig,
            identificationsConfig,
            lastmileProviderTrackingNumber,
            lastmileProviderMapKey,
          );

          dto.parcel = dto.parcels[index];
          const singleParcel = this._buildParcelData({ ...config, ...dto, ...item });
          singleParcel.hubCode = colissimoHub?.hubCode || item.sortCode;
          item.sortCode = item.sortCode || colissimoHub?.hubCode;
          return singleParcel;
        });

        // save request , 多包裹的request放到了数组第一个
        if (this.saveRequestLog) {
          await this.requestLogRepository.save({
            trackingNumber: result[0].trackingNumber,
            transporterRequest: result[0].transporterRequest, //发给服务商的请求
            transporterResponse: result[0].transporterResponse, //服务商返回
            requestBody: JSON.stringify(originalDto), //平台发给cms
            transporter: config.transporterId,
            elapsedTime,
            status: RequestStatusEnum.SUCCESS,
            clientId: dto.clientId,
            platform: dto.platform,
            channel: dto.code,
            clientReference: dto?.parcel?.reference,
            applicationRequest: dto.options?.applicationRequest,
            traceId: dto.options?.traceId,
          });
        }

        result[0] = _.omit(result[0], ['transporterRequest', 'transporterResponse']);

        // 保存包裹、添加单号池
        const saveResults = await this.saveParcel(data);
        const saveResultMap = _.mapKeys(saveResults, 'trackingNumber');

        const trackingNumber = result[0].trackingNumber;
        const { smsProductCode } = this.platformService.getSmsProduct(dto.platform, config.transporterId);
        if (smsProductCode) {
          // 异步推送分拣包裹给SMS
          this.smsService
            .pushSortingParcelBatch(smsProductCode, [
              {
                trackingNumber,
                transporter: config.transporterId,
                postalCode: dto.receiverAddress.postalCode,
                clientId: dto.clientId,
                platform: dto.platform,
                waybillNumber: result[0].waybillNumber,
                barcode: result[0].barCode,
              },
            ])
            .catch(reason => {
              if (process.env.NODE_ENV.includes('production')) {
                this.xPushService.sendDingDing(`推送SMS包裹(${trackingNumber})失败：${reason}`);
              }
            });
        }

        result.forEach(f => {
          f.parcelId = saveResultMap[f.trackingNumber].id;
        });

        return {
          parcels: result,
          transporter: config.transporterId,
          client: dto.clientId,
          platform: dto.platform,
          trackingNumber,
          lastmileProvider: result[0].lastmileProvider,
          parcelId: result[0].parcelId,
          senderAddress: dto.options.useSenderAddress ? dto.senderAddress : null,
        };
      }
    } catch (e) {
      await this.saveExceptionInformation(config, originalDto, e, startDateTime);
      throw e;
    }
  }

  /**
   * 下单获取lastmileProvider
   * @param trackingNumber
   * @param transporterConfig
   * @param identificationsConfig
   * @param lastmileProviderTrackingNumber 派送商返回用于识别尾程派送商的单号 目前【COLISPRIVE】
   * @param lastmileProviderMapKey 派送商返回用于映射尾程派送商 目前【ESPOST】
   */
  _getParcelLastmileProvider(
    trackingNumber: string,
    transporterConfig: any,
    identificationsConfig: any[],
    lastmileProviderTrackingNumber: string,
    lastmileProviderMapKey: string,
  ) {
    let lastmileProvider = null;
    switch (transporterConfig.lastmileProviderType) {
      case LastmileProviderTypeEnum.CMS_IDENTIFICATION:
        lastmileProvider = this.lastmileProviderIdentificationService.getLastmileProvider(
          lastmileProviderTrackingNumber || trackingNumber,
          identificationsConfig,
        );
        break;

      case LastmileProviderTypeEnum.TRANSPORTER_DECLARE:
        lastmileProvider = LastmileProviderMapEnum[lastmileProviderMapKey];
        break;

      case LastmileProviderTypeEnum.TRANSPORTER_DEFAULT:
        lastmileProvider = transporterConfig.lastmileProvider;
        break;
      default:
        break;
    }
    return lastmileProvider || transporterConfig.lastmileProvider;
  }

  /**
   * 保存包裹、添加单号池
   * @param data
   */
  async saveParcel(data): Promise<{ id: number; tracking: string }[]> {
    const trackingNumbers = data.map(item => item.trackingNumber);

    try {
      // 使用单号池对单号唯一性进行校验（排除菜鸟）
      if (data[0].transporter !== 'CAINIAO') {
        await this._checkPoolExist(trackingNumbers, data[0].transporter);
      }

      const saveResults = await this.repo.save(data);
      // 提升下单速率，减少数据库沟通时间，进行异步提交
      this._insertIntoPool(trackingNumbers).then();

      return saveResults.map(m => ({
        id: m.id,
        trackingNumber: m.trackingNumber,
      }));
    } catch (e) {
      // 如果是菜鸟重复下单，不抛错，流程继续。只发送钉钉通知。
      if (
        _.includes(e.message, 'duplicate key value violates unique constraint') &&
        _.includes(e.message, 'tracking_number') &&
        data[0].transporter === 'CAINIAO'
      ) {
        // this.xPushService.sendDingDing(
        //   '**<font color="#6F81DB">【CAINIAO】reference重复出单记录</font>**\n\n'+
        //   `* 平台：${data[0].platform}\n\n`+
        //   `* 客户：${data[0].clientId}\n\n`+
        //   `* 单号：${data[0].trackingNumber}\n\n`+
        //   `* reference：${data[0].reference}`,
        //   'scheduler',
        // );

        return trackingNumbers.map(m => ({
          id: null,
          trackingNumber: m,
        }));
      } else {
        throw e;
      }
    }
  }

  async saveExceptionInformation(config, dto, e, startDateTime) {
    let cmsError, transporterError, transporterRequest;
    if (_.startsWith(e.message, 'FTL:')) {
      cmsError = e.message;
    } else {
      transporterError = e.message;
      transporterRequest = JSON.stringify(e.cmsTransporterRequest);
    }

    const parcel = dto.parcel || dto.parcels[0];
    const elapsedTime = moment().diff(startDateTime);
    if (this.saveRequestLog) {
      await this.requestLogRepository.save({
        productCode: config.productCode,
        transporter: config.transporterId,
        requestBody: JSON.stringify(dto),
        transporterRequest,
        status: RequestStatusEnum.FAILED,
        clientId: dto.clientId,
        platform: dto.platform,
        channel: dto.code,
        clientReference: parcel.reference || '',
        applicationRequest: dto.options?.applicationRequest,
        traceId: dto.options?.traceId,
        cmsError,
        transporterError,
        elapsedTime,
      });
    }
  }

  async getShipmentRate(dto: CreateParcelDto) {
    const config: IChannelConfig = await this._getChannelConfig(dto);
    config.labelFormat = config.labelFormats.find(label => label.code === dto.labelFormat);

    //验证渠道信息
    this.parcelCreateValidationService.validateChannel({ config, dto });

    const client = this._getClient(config.transporterId);
    const services = await client.getShipmentRate(dto, config);

    return services.find(item => item.attributes.type === config.productCode);
  }

  async searchOrderInfo(shipmentInfos: ShipmentInfoDto[]) {
    const result = {};
    for (const shipmentInfo of shipmentInfos) {
      const config: IChannelConfig = await this._getChannelConfig({ code: shipmentInfo.channelCode });
      const client = this._getClient(config.transporterId);
      let res = undefined;
      try {
        res = await client.searchShipmentInfo(shipmentInfo.reference, config);
      } catch (e) {
        res = e.message;
      }
      result[shipmentInfo.reference] = res;
    }
    return result;
  }

  async uploadEtdFile(dto: UploadEtdFileDto) {
    const channelConfig = await this._getChannelConfig(dto);
    return this._getClient(channelConfig.transporterId).uploadEtdFile(dto, channelConfig);
  }

  async cancelParcel(dto: CancelParcelDto) {
    let config;
    const parcel = await this.findOne({ where: { shippingNumber: dto.shippingNumber } });
    if (parcel.channel && parcel.apiVersion === 'v2') {
      config = await this._getChannelConfig({ code: parcel.channel });
    }
    // 判断是否是用客户账号下单，是-则替换相关账户信息
    if (config.isClientAccount) {
      config.accountInfo = dto.accountInfo;
    }
    return this._getClient(parcel.transporter).cancelShipment(dto, config);
  }

  async schedulePickup(dto: CreatePickupDto) {
    const originalDto = _.cloneDeep(dto);
    const config = await this._getChannelConfig({ code: dto.channel });
    // 判断是否是用客户账号下单，是-则替换相关账户信息
    if (config.isClientAccount) {
      config.accountInfo = dto.accountInfo;
    }
    const startDateTime = moment().toDate();
    const result = await this._getClient(config.transporterId).schedulePickup(dto, config);
    const elapsedTime = moment().diff(startDateTime);

    if (this.saveRequestLog) {
      await this.requestLogRepository.save({
        trackingNumber: result.PRN,
        transporterRequest: result.transporterRequest, //发给服务商的请求
        transporterResponse: result.transporterResponse, //服务商返回
        requestBody: JSON.stringify(originalDto), //平台发给cms
        transporter: config.transporterId,
        elapsedTime,
        channel: dto.channel,
        status: RequestStatusEnum.SUCCESS,
        platform: config.platform,
      });
    }
    return result.returnResult;
  }

  async cancelPickup(dto) {
    const config = await this._getChannelConfig({ code: dto.channel });
    // 判断是否是用客户账号下单，是-则替换相关账户信息
    if (config.isClientAccount) {
      config.accountInfo = dto.accountInfo;
    }
    return this._getClient(dto.transporter).cancelPickup(dto, config);
  }

  //TODO 确认query 写dto
  async findParcels({ trackingNumbers, startDate = null, endDate = null, platform = null, clientId = null }) {
    if (startDate) {
      endDate =
        endDate ||
        moment()
          .add(1, 'days')
          .format('YYYY-MM-DD');
    }
    return await this.getParcelsWithArchived(
      {
        trackingNumbers,
        platform,
        startDate,
        endDate,
        clientId,
      },
      false,
    );
  }

  //TODO 确认query 写dto
  async findParcelsAndTrackings({
    trackingNumbers,
    language = 'en',
    dataSource,
    startDate = null,
    endDate = null,
    platform = null,
  }) {
    if (startDate) {
      endDate =
        endDate ||
        moment()
          .add(1, 'days')
          .format('YYYY-MM-DD');
    }
    // 获取包裹（含已归档的）
    const parcels = await this.getParcelsWithArchived({ trackingNumbers, platform, startDate, endDate }, true);

    parcels.forEach(parcel => {
      parcel.trackings = this.filterTrackingByDataSources(parcel.trackings, dataSource);
    });
    const events = _.chain(parcels)
      .map('trackings')
      .flattenDeep()
      .map('event')
      .uniq()
      .value();
    const trackingEvents = await this.getTrackingEvents(events);
    // todo 可以和 getTrackings里的方法合并
    language = language === 'cn' ? 'zh' : language; // 如果是cn更换为zh
    return _.map(parcels, parcel => {
      if (parcel.trackings && _.size(parcel.trackings) > 0) {
        parcel.trackings = _.map(parcel.trackings, tracking => {
          const trackingEvent =
            _.find(trackingEvents, v => v.event === tracking.event && v.transporter === parcel.transporter) ||
            _.find(trackingEvents, v => v.event === tracking.event && !v.transporter);
          return {
            ...tracking,
            description: trackingEvent && trackingEvent[language] ? trackingEvent[language] : tracking.description,
            parcelStatus: trackingEvent ? trackingEvent.parcelStatus : null,
          };
        });
        parcel.trackings = trackingSort(parcel.transporter, parcel.trackings, trackingEvents);
      }
      const lastEvent =
        _.find(
          trackingEvents,
          v => parcel.lastEvent && v.event === parcel.lastEvent && v.transporter === parcel.transporter,
        ) || _.find(trackingEvents, v => parcel.lastEvent && v.event === parcel.lastEvent && !v.transporter);
      parcel.lastDescription = lastEvent && lastEvent[language] ? lastEvent[language] : parcel.lastDescription;
      return parcel;
    });
  }

  async findParcelTrackings(body) {
    const trackings = await this.findParcelsAndTrackings(body);
    return trackings.map(tracking => ({
      clientId: tracking.clientId,
      number: tracking.trackingNumber,
      comment: tracking.lastDescription,
      event: tracking.lastEvent,
      type: 'DELIVER',
      timestamp: tracking.lastTimestamps,
      traces: _.orderBy(
        tracking.trackings.map(item => ({
          number: item.trackingNumber,
          comment: item.description,
          event: item.event,
          timestamp: item.timestamp,
        })),
        'timestamp',
        'desc',
      ),
    }));
  }

  /**
   * 获取包裹（含已归档的）
   * @param trackingNumbers
   * @param platform
   * @param startDate
   * @param endDate
   * @param withTracking 是否带出轨迹
   * @private
   */
  private async getParcelsWithArchived(
    { trackingNumbers, platform, startDate, endDate, clientId = null },
    withTracking = false,
  ) {
    const parcels = [];
    // 1. 先通过trackingNumbers查找包裹
    const where: FindConditions<Parcel | ParcelAll> = {
      trackingNumber: In(trackingNumbers),
    };
    const relations = withTracking ? ['trackings'] : [];
    let repository = this.repo;

    if (platform) {
      where.platform = platform;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (startDate) {
      where.createdAt = Between(startDate, endDate);
      repository = getRepository(ParcelAll);
    }

    const parcels1 = await repository.find({
      where,
      relations,
    });
    parcels.push(...parcels1);

    // 2. 根据trackingNumber未找到的包裹，再根据shippingNumber查找
    const notFoundTrackingNumbers = _.difference(
      trackingNumbers,
      parcels1.map(parcel => parcel.trackingNumber),
    );
    if (!_.isEmpty(notFoundTrackingNumbers)) {
      delete where.trackingNumber;
      where.shippingNumber = In(notFoundTrackingNumbers);

      const parcels2 = await repository.find({
        where,
        relations,
      });

      parcels.push(...parcels2);
    }

    // 3.如果要带出轨迹，则筛选符合时间段的轨迹
    if (startDate && withTracking) {
      parcels.forEach(f => {
        f.trackings = f.trackings.filter(
          t => moment(t.createdAt).isSameOrAfter(startDate) && moment(t.createdAt).isSameOrBefore(endDate),
        );
      });
    }

    return parcels;
  }

  //TODO options的类型声明
  async getTrackings(trackingNumber, query: QueryTrackingDto) {
    const { order = 'asc', language = 'fr', dataSource = 'DEFAULT', originalText = 'false' } = query;
    // todo delete applicationToPlatform
    query.platform = query?.platform || query?.application;
    const languages = language.split(',');

    // 获取包裹（含已归档的）
    const [parcel] = await this.getParcelsWithArchived(
      {
        trackingNumbers: [trackingNumber],
        platform: query.platform,
        startDate: query.startDate,
        endDate: query.endDate,
      },
      true,
    );
    if (!parcel) {
      throw new BadRequestException(`parcel(${trackingNumber}) is not exist in CMS system.`);
    }

    let trackings = parcel.trackings;

    trackings = this.filterTrackingByDataSources(trackings, dataSource);
    // trackingEvent 中获取对应的event
    const trackingEvents = await this.getTrackingEvents(_.map(trackings, 'event'));
    if (trackings && trackings.length) {
      let trackingList;
      if (originalText === 'false') {
        trackingList = languages.flatMap(language => {
          language = language === 'cn' ? 'zh' : language; // 如果是cn更换为zh
          const i18nTrackingList = trackings.map(item => {
            const trackingEvent =
              _.find(trackingEvents, v => v.event === item.event && v.transporter === parcel.transporter) ||
              _.find(trackingEvents, v => v.event === item.event && !v.transporter);
            return {
              language,
              trackingNumber: item.trackingNumber,
              reference: item.reference,
              event: item.event,
              description: trackingEvent && trackingEvent[language] ? trackingEvent[language] : item.description,
              timestamp: item.timestamp,
              location: item.location,
            };
          });
          return _.orderBy(i18nTrackingList, ['timestamp'], [order]);
        });
      } else {
        trackingList = _.map(trackings, item => {
          return {
            language: 'originalCountryLanguage',
            trackingNumber: item.trackingNumber,
            reference: item.reference,
            event: item.event,
            description: item.description,
            timestamp: item.timestamp,
            location: item.location,
          };
        });
      }
      return trackingSort(parcel.transporter, trackingList, trackingEvents, order);
    }
    return [];
  }

  @CacheClear({ cacheKey: 'CMS', isPattern: true })
  async clear() {}

  async _getChannelConfig({ code }) {
    return await this._getConfig(code);
  }

  private async _getConfig(code) {
    const config = this.nacosRepository.getChannelCodeConfig(code);
    if (!config) {
      throw new BadRequestException(`FTL:The channel code ${code} doesn't be found, please contact the administrator.`);
    }

    const transporterApi = await this._getTransporterApi();

    const url = transporterApi?.find(api => api.transporter === config.transporterId && api.enabled)?.apiUrl;

    if (!url) {
      throw new BadRequestException(`FTL: ${code},shipment url not found，please contact the administrator.`);
    }
    return {
      ...config,
      shipmentUrl: url,
    };
  }

  @Cacheable({ cacheKey: 'CMS_TRANSPORTER_API', ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async _getTransporterApi() {
    return await getRepository(TransporterApi).find();
  }

  _getClient(transporter) {
    return this.transporterBrokerFactory.getBroker(transporter);
  }

  _buildParcelData(data: CreateParcelResponse & CreateParcelDto & IChannelConfig) {
    const {
      account,
      receiverAddress: { postalCode, countryCode, city },
    } = data;
    const parcel = data.parcel || data.parcels[0];
    return {
      ..._.pick(data, ['trackingNumber', 'shippingNumber', 'clientId', 'platform', 'shippingDate', 'lastmileProvider']),
      status: 'CREATED',
      transporter: data.transporterId, // parcel表结构上还是transporter
      transporterAccountId: account,
      receiverPostalCode: postalCode,
      receiverCountryCode: countryCode,
      receiverCity: city,
      declaredAt: data.shippingDate,
      channel: data.code,
      apiVersion: 'v2',
      insuranceValue: parcel.insuranceValue,
      productCode: data.productCode,
      reference: parcel.reference,
    };
  }

  /**
   * 将 tracking 数组根据时间去重 优先取 轨迹文件中的
   * @param trackingArray
   * @param dataSource
   */
  private filterTrackingByDataSources(trackingArray: Tracking[], dataSource?: string): Tracking[] {
    switch (dataSource) {
      case 'TRACKING_FILE': {
        return trackingArray.filter(tracking => tracking.fromFile);
      }
      case 'WEBSITE': {
        return trackingArray.filter(tracking => !tracking.fromFile);
      }
      default: {
        return trackingArray;
      }
    }
  }

  async saveOutsideParcel(outsideParcelArray: OutsideParcelDto[]) {
    // 检查单号是否已经存在
    const trackingNumberArray = outsideParcelArray.map(item => item.trackingNumber);
    const dbParcelArray = await this.find({
      select: ['trackingNumber'],
      where: {
        trackingNumber: In(trackingNumberArray),
      },
    });
    if (!!dbParcelArray && !!dbParcelArray.length) {
      throw new BusinessException(
        `TrackingNumber为${dbParcelArray.map(item => item.trackingNumber).join(',')}的包裹已存在`,
      );
    }

    const parcelArray = [];
    for (const outsideParcel of outsideParcelArray) {
      const channelInfo = await this._getChannelConfig({ code: outsideParcel.channel });
      const parcel = <Parcel>outsideParcel;
      parcel.transporter = channelInfo.transporterId;
      parcel.platform = channelInfo.platform;
      parcel.transporterAccountId = channelInfo.account;
      parcel.apiVersion = 'v2';
      parcel.insuranceValue = 0;
      parcel.status = 'CREATED';
      parcel.declaredAt = parcel.declaredAt ? moment(parcel.declaredAt).toDate() : new Date();
      parcel.productCode = channelInfo.productCode;
      parcelArray.push(parcel);
    }
    return await this.repo.save(parcelArray, { chunk: 1000 });
  }

  async modifyShipment(dto: CreateParcelDto) {
    const config = await this._getChannelConfig({ code: dto.code });
    config.labelFormat = config.labelFormats.find(label => label.code === dto.labelFormat);

    const startDateTime = moment().toDate();
    const result = await this._getClient(config.transporterId).modifyShipment(dto, config);
    const elapsedTime = moment().diff(startDateTime);

    // 组装 parcel entity，进行更新操作
    const data = this._buildParcelData({ ...config, ...dto, ...result });
    await this.repo.update(
      { trackingNumber: result.trackingNumber },
      {
        receiverCity: data.receiverCity,
        receiverCountryCode: data.receiverCountryCode,
        receiverPostalCode: data.receiverPostalCode,
        clientId: data.clientId,
        insuranceValue: data.insuranceValue,
      },
    );

    if (this.saveRequestLog) {
      // 存入request-param
      await this.requestLogRepository.save({
        trackingNumber: result.trackingNumber,
        transporterRequest: result.transporterRequest, //发给服务商的请求
        transporterResponse: result.transporterResponse, //服务商返回
        requestBody: JSON.stringify(dto), //平台发给cms
        transporter: config.transporterId,
        elapsedTime,
      });
    }

    const response = _.omit(result, ['transporterRequest', 'transporterResponse']);
    return {
      parcels: [response],
      transporter: config.transporterId,
      client: dto.clientId,
      platform: dto.platform,
      trackingNumber: result.trackingNumber,
    };
  }

  /**
   * 获取TrackingEvents
   * 使用缓存
   * @param events
   */
  async getTrackingEvents(events) {
    let trackingEvents = [];
    for (const event of events) {
      const trackingEventList = await this.trackingEventService.findTrackingEventWithLock(event);
      trackingEvents = _.concat(trackingEvents, trackingEventList);
    }
    return trackingEvents;
  }

  /**
   * 获取需要导出的包裹信息
   * @param trackingNumbers
   */
  async getExportParcels(trackingNumbers: string[]) {
    let parcels = [];

    for (const chunkTrackingNumbers of _.chunk(trackingNumbers, 1000)) {
      const partParcels = await this.repo
        .createQueryBuilder('parcel')
        .leftJoinAndSelect(BillDetail, 'billDetail', 'parcel.trackingNumber = billDetail.trackingNumber')
        .where('parcel.trackingNumber in (:...trackingNumbers)', { trackingNumbers: chunkTrackingNumbers })
        .select('parcel.trackingNumber', 'trackingNumber')
        .addSelect('parcel.transporter', 'transporter')
        .addSelect('parcel.platform', 'platform')
        .addSelect('parcel.channel', 'channel')
        .addSelect('parcel.transporterAccountId', 'transporterAccountId')
        .addSelect('parcel.clientId', 'clientId')
        .addSelect('parcel.lastEvent', 'lastEvent')
        .addSelect('parcel.lastDescription', 'lastDescription')
        .addSelect('parcel.lastTimestamps', 'lastTimestamps')
        .addSelect('parcel.receiverCountryCode', 'receiverCountryCode')
        .addSelect('parcel.receiverPostalCode', 'receiverPostalCode')
        .addSelect('parcel.receiverCity', 'receiverCity')
        .addSelect('parcel.createdAt', 'createdAt')
        .addSelect('parcel.transferredAt', 'transferredAt')
        .addSelect('parcel.arrivedAt', 'arrivedAt')
        .addSelect('parcel.supplierWeight', 'supplierWeight')
        .addSelect('billDetail.weight', 'billWeight')
        .getRawMany();

      parcels = parcels.concat(partParcels);
    }

    return parcels;
  }

  /**
   * 批量查询包裹(分页)
   * @param body
   */
  async findListByTrackingNumbers(body: pageParamsType, platform?: string, clientId?: string) {
    const { page = 1, limit = 20, trackingNumbers = [], sort = [] } = body;
    const queryBuilder = this.repo
      .createQueryBuilder('parcel')
      .leftJoin(BillDetail, 'billDetail', 'parcel.trackingNumber = billDetail.trackingNumber')
      .select('parcel.trackingNumber', 'trackingNumber')
      .addSelect('parcel.transporter', 'transporter')
      .addSelect('parcel.platform', 'platform')
      .addSelect('parcel.channel', 'channel')
      .addSelect('parcel.transporterAccountId', 'transporterAccountId')
      .addSelect('parcel.clientId', 'clientId')
      .addSelect('parcel.lastEvent', 'lastEvent')
      .addSelect('parcel.lastDescription', 'lastDescription')
      .addSelect('parcel.lastTimestamps', 'lastTimestamps')
      .addSelect('parcel.receiverCountryCode', 'receiverCountryCode')
      .addSelect('parcel.receiverPostalCode', 'receiverPostalCode')
      .addSelect('parcel.receiverCity', 'receiverCity')
      .addSelect('parcel.createdAt', 'createdAt')
      .addSelect('parcel.transferredAt', 'transferredAt')
      .addSelect('parcel.arrivedAt', 'arrivedAt')
      .addSelect('parcel.supplierWeight', 'supplierWeight')
      .addSelect('billDetail.weight', 'billWeight')
      .where(`parcel.trackingNumber in (:...trackingNumbers)`, { trackingNumbers })
      .andWhere(platform ? `parcel.platform = '${platform}'` : `1=1`)
      .andWhere(clientId ? `parcel.clientId = '${clientId}'` : `1=1`)
      .limit(limit)
      .offset((page - 1) * limit);
    if (sort.length) {
      let field = sort[0];
      if (field === 'createdAt') {
        field = 'parcel.created_at::TIMESTAMP';
      }
      queryBuilder.orderBy(field, sort[1].toLocaleUpperCase());
    }
    return await queryBuilder.getRawMany();
  }

  /**
   * 根据条件查询包裹数量
   * @param body
   */
  async getCountByCondition(body: string[]) {
    function getBuilder() {
      return getConnection()
        .createQueryBuilder(Parcel, 'parcel')
        .where(`tracking_number in (:...trackingNumbers)`, { trackingNumbers: body });
    }

    return {
      parcelCount: await getBuilder().getCount(),
      transferredCount: await getBuilder()
        .andWhere(`transferred_at is not null`)
        .getCount(),
      isArrivedCount: await getBuilder()
        .andWhere(`is_arrived = 't'`)
        .getCount(),
    };
  }

  getUploadPath(transporter: string, platform: string, clientId: string, fileName: string) {
    return `parcel/label/${transporter}/${platform}/${clientId || platform + 'Client'}/${fileName}`;
  }

  /**
   * 获取面单文件url
   * @param trackingNumbers
   */
  async getLabelUrls(trackingNumbers: string[]) {
    const urls = [];
    const bucketName = this.configService.get('Bucket').cms;
    for (const chunkTrackingNumbers of _.chunk(trackingNumbers, 1000)) {
      const parcels = await this.repo.find({
        where: {
          trackingNumber: In(chunkTrackingNumbers),
        },
        relations: ['parcelLabel'],
      });

      for (const { trackingNumber, transporter, platform, clientId, parcelLabel } of parcels) {
        let path;
        // 先从面单表获取路径，找不到再拼路径
        if (parcelLabel && parcelLabel.path) {
          path = parcelLabel.path;
        } else {
          // 获取后缀
          const extension = await this.getFileExtension(trackingNumber, transporter);
          // 文件路径
          const path1 = this.getUploadPath(transporter, platform, clientId, `${trackingNumber}.${extension}`);
          const path2 = this.getUploadPath(transporter, platform, clientId, `${trackingNumber}-1.${extension}`);
          const path3 = this.getUploadPath(transporter, platform, clientId, `${trackingNumber}-1.PDF`);

          if (extension === 'pdf') {
            // 因历史文件中有大量的错误文件名，修改比较麻烦，故在此处兼容
            // 先校验path1是否存在，不存在则用path3
            const isExist = await this.awsService.exists(path1, bucketName);
            path = isExist ? path1 : path3;
          } else {
            path = path2;
          }
        }

        const isExist = await this.awsService.exists(path, bucketName);
        if (!isExist) {
          throw new BusinessException(`Fail to download，Label not found in s3`);
        }

        // 获取文件保存路径
        const url = await this.awsService.getSignedUrl(path, bucketName, 0);
        urls.push(url);
      }
    }

    return urls;
  }

  /**
   * 获取文件后缀
   * @param trackingNumber
   * @param transporterId
   * @private
   */
  private async getFileExtension(trackingNumber: string, transporterId: string) {
    let extension = 'pdf';

    const requestLog = await getRepository(RequestLog).findOne({ trackingNumber });
    if (requestLog) {
      const code = JSON.parse(requestLog.requestBody).labelFormat;

      const labelFormatArray = this.nacosRepository.getLabelFormatConfig(transporterId);

      let labelType = labelFormatArray.find(f => f.code === code)?.labelType;
      if (!labelType) {
        labelType = labelFormatArray.find(f => code.includes(f.labelType))?.labelType;
      }

      if (labelType) {
        switch (true) {
          case ['dpl', 'pdf', 'jpg', 'gif', 'bmp', 'png', 'PNG', 'zpl', 'ipl', 'ZPL'].includes(labelType):
            extension = labelType;
            break;
          case labelType === 'PDF':
            extension = 'pdf';
            break;
          case ['ZPLII', 'application/zpl'].includes(labelType):
            extension = 'zpl';
            break;
          case labelType === 'application/pdf':
            extension = 'pdf';
            break;
          default:
            extension = labelType;
            break;
        }
      }
    }

    return extension;
  }

  public async _uploadLabelToS3(result: CreateMultiParcelResponse, options: any) {
    const parcels = result.parcels.filter(parcel => !!parcel.label);
    if (!_.isEmpty(parcels)) {
      const labelFormat = result.parcels[0].labelFormat;
      if (labelFormat.toLowerCase() === 'pdf') {
        let path = (options && options.path) || undefined;
        if (!path) {
          const fileName = result.trackingNumber + '.pdf';
          path = this.getUploadPath(result.transporter, result.platform, result.client, fileName);
        }
        const buffers = parcels.map(parcel => Buffer.from(parcel.label, 'base64'));
        const labelBuffer = Buffer.from(await PDFUtils.merge(buffers));
        await this.awsService.uploadFile(labelBuffer, path, this.configService.get('Bucket').cms);

        const parcelLabels = parcels.map(parcel => {
          return ParcelLabel.create({
            parcelId: parcel.parcelId || result.parcelId,
            trackingNumber: parcel.trackingNumber,
            format: 'pdf',
            path,
            barcode: parcel.barCode,
          });
        });
        await getRepository(ParcelLabel).save(parcelLabels);
      } else {
        // UPS 通常需要 jpg 所以特殊处理
        for (let i = 0; i < parcels.length; i++) {
          const parcel = parcels[0];
          const fileName = `${parcel.trackingNumber}-${i + 1}.${labelFormat}`;
          const path = this.getUploadPath(result.transporter, result.platform, result.client, fileName);
          const buffer = Buffer.from(parcel.label, 'base64');
          await this.awsService.uploadFile(buffer, path, this.configService.get('Bucket').cms);
          await getRepository(ParcelLabel).save({
            parcelId: parcel.parcelId,
            trackingNumber: parcel.trackingNumber,
            format: labelFormat,
            path,
            barcode: parcel.barCode,
          });
        }
      }
    }
  }

  public async _uploadInvoiceToS3(result: CreateMultiParcelResponse, options?: any) {
    const buffers = result.parcels
      .filter(parcel => parcel.invoice)
      .map(parcel => Buffer.from(parcel.invoice, 'base64'));
    if (!_.isEmpty(buffers)) {
      const labelBuffer = Buffer.from(await PDFUtils.merge(buffers));
      const path = `parcel/invoice/${result.transporter}/${result.platform}/${result.client ||
        result.platform + 'Client'}/${result.trackingNumber}.pdf`;
      await this.awsService.uploadFile(labelBuffer, path, this.configService.get('Bucket').cms);

      // 如果是CHRONOPOST且是无纸化清关，则需要上传发票给派送商
      if (result.transporter === 'CHRONOPOST' && options?.isPaperLess && process.env.NODE_ENV === 'production') {
        await new KafkaProducer(this.xPushService).sendKafka('CMS_INVOICE_PUSH', {
          trackingNumber: result.trackingNumber,
          s3Path: path,
        });
      }
    }
  }

  public async _insertIntoPool(trackingNumbers: string[]) {
    const pools = trackingNumbers.map(trackingNumber => {
      return {
        trackingNumber,
      };
    });
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(TrackingNumberPool)
      .values(pools)
      .orIgnore()
      .execute();
  }

  public async _checkPoolExist(trackingNumbers: string[], transporter = '') {
    if (process.env.CHECK_TRACKING_NUMBER_POOL) {
      const existsTrackingNumber = await getConnection()
        .getRepository(TrackingNumberPool)
        .findOne({ trackingNumber: In(trackingNumbers) });
      if (existsTrackingNumber) {
        if (transporter === 'COLISSIMO') {
          this.xPushService.sendDingDing(`trackingNumber:${existsTrackingNumber} already exists`, 'default', [
            '15068737852',
            '15658835072',
          ]);
          this.xPushService.sendDingDing(`trackingNumber:${existsTrackingNumber} already exists`, 'default');
        }
        throw new BadRequestException('trackingNumber already exists, please try again！');
      }
    }
  }

  async getLabels(codes: string[]) {
    if (_.isEmpty(codes)) {
      throw new BusinessException('单号不可为空');
    }
    const bucketName = this.configService.get('Bucket').cms;

    const parcels = await this.repo.find({
      where: [
        {
          trackingNumber: In(codes),
        },
        {
          reference: In(codes),
        },
      ],
      relations: ['parcelLabel'],
    });

    const promises = parcels.map(async parcel => {
      return {
        trackingNumber: parcel.trackingNumber,
        shippingNumber: parcel.shippingNumber,
        reference: parcel.reference,
        format: parcel.parcelLabel.format,
        url: await this.awsService.getSignedUrl(parcel.parcelLabel.path, bucketName, 0),
      };
    });

    return await Promise.all(promises);
  }

  async pushToSMS(trackingNumbers: string[], platform?: string) {
    const halfYearBefore = moment()
      .subtract(6, 'month')
      .format('YYYY-MM-DD');
    const errors = [];

    for (const chunkTrackingNumbers of _.chunk(trackingNumbers, 500)) {
      const where: FindConditions<Parcel> = {
        trackingNumber: In(chunkTrackingNumbers as string[]),
        createdAt: MoreThan(halfYearBefore),
      };
      if (platform) {
        where.platform = platform;
      }
      const parcels = await this.repo.find({
        where,
        relations: ['parcelLabel'],
      });

      try {
        const parcelArrayGroup = _.groupBy(parcels, 'transporter');
        for (const transporter in parcelArrayGroup) {
          const parcels = parcelArrayGroup[transporter];
          const firstParcel = parcels[0];
          const { smsProductCode } = this.platformService.getSmsProduct(
            firstParcel?.platform,
            firstParcel?.transporter,
          );
          if (smsProductCode) {
            await this.smsService.pushSortingParcelBatch(
              smsProductCode,
              parcels.map(parcel => {
                return {
                  trackingNumber: parcel.trackingNumber,
                  transporter: parcel.transporter,
                  platform: parcel.platform,
                  postalCode: parcel.receiverPostalCode,
                  clientId: parcel.clientId,
                  waybillNumber: '',
                  barcode: parcel.parcelLabel?.barcode,
                };
              }),
            );
          } else {
            errors.push(`推送SMS包裹(${chunkTrackingNumbers[0]}等等)无需推送。`);
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV.includes('production')) {
          errors.push(`推送SMS包裹(${chunkTrackingNumbers.toString()})失败：${e}。`);
        }
      }
    }

    if (_.isEmpty(errors)) {
      return 'success';
    } else {
      this.xPushService.sendDingDing(errors.toString());
      return errors.toString();
    }
  }

  /**
   * 从一批单号中筛选出：通过FTL账号下单的单号
   * @param trackingNumbers
   */
  async getFTLParcels(trackingNumbers: string[]) {
    if (_.isEmpty(trackingNumbers)) {
      return [];
    }

    const ftlAccounts = [
      '925764',
      '816272',
      '869268',
      '955430',
      '973648',
      '973649',
      '966036',
      '897769',
      '955428',
      '966262',
      '964836',
      '966037',
      '818301',
      '811258',
      '896880',
      '896877',
      '896998',
      '835829',
      '812703',
    ];

    const halfYearBefore = moment()
      .subtract(6, 'month')
      .format('YYYY-MM-DD');

    const parcels = await this.repo.find({
      where: {
        createdAt: MoreThan(halfYearBefore),
        trackingNumber: In(trackingNumbers),
        transporterAccountId: In(ftlAccounts),
        transporter: 'COLISSIMO',
      },
      select: ['trackingNumber'],
    });

    return parcels.map(m => m.trackingNumber);
  }
}
