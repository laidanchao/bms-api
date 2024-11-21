import { Inject, Injectable } from '@nestjs/common';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { OutsideParcelDto } from '@/domain/ord/parcel/dto/outside-parcel.dto';
import { In, Repository } from 'typeorm';
import moment from 'moment';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import _ from 'lodash';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { FindConditions } from 'typeorm/find-options/FindConditions';
import { TransporterService } from '@/domain/sci/transporter/service/transporter.service';
import { LastmileProviderIdentificationService } from '@/domain/sci/lastmile-provider/service/lastmile-provider-identification.service';
import { OutsideExternalParcelDto } from '@/domain/ord/parcel/dto/outside-external-parcel.dto';

@Injectable()
export class ParcelExtendService {
  constructor(
    @Inject(ParcelRepository) private readonly parcelRepository: ParcelRepository,
    @InjectRepository(CamChannel) private channelRepository: Repository<CamChannel>,
    private readonly transporterService: TransporterService,
    private readonly lastmileProviderIdentificationService: LastmileProviderIdentificationService,
  ) {}

  async findOne(options: FindConditions<Parcel>) {
    return await this.parcelRepository.findOne(options);
  }

  async find(options) {
    return await this.parcelRepository.find(options);
  }

  async update(criteria, parcel) {
    return await this.parcelRepository.update(criteria, parcel);
  }

  async updateParcel(targetParcel: Parcel, sourceParcel: Parcel) {
    return await this.parcelRepository.updateParcel(targetParcel, sourceParcel);
  }

  async countParcelQuantity(startDate: any, endDate: any, target: string) {
    return await this.parcelRepository.countParcelQuantity(startDate, endDate, target);
  }

  async findYesterdayArrivedTrackingNumber() {
    return await this.parcelRepository.findYesterdayArrivedTrackingNumber();
  }

  async dailyClientTransferredParcelStats(startDate, endDate, client, transporter) {
    return await this.parcelRepository.dailyClientTransferredParcelStats(startDate, endDate, client, transporter);
  }

  async dailyClientCreatedParcelStats(startDate, endDate, client, transporter) {
    return await this.parcelRepository.dailyClientCreatedParcelStats(startDate, endDate, client, transporter);
  }

  async bulkInsert(parcelArray) {
    return await this.parcelRepository.bulkInsert(parcelArray);
  }

  async bulkUpdate(parcels, updateColumns: string[]) {
    return await this.parcelRepository.bulkUpdate(parcels, updateColumns);
  }

  async importAlgeriaParcel(bucket, s3Key) {
    return await this.parcelRepository.importAlgeriaParcel(bucket, s3Key);
  }

  async countByPlatform(options) {
    return await this.parcelRepository.trackingNumberCountByPlatform(options);
  }

  /**
   * 只获取未收集的包裹数据
   * @param options
   */
  async countByPlatformNotCollected(options) {
    return await this.parcelRepository.countByPlatformNotCollected(options);
  }

  async fetchTrackingNumbers(where, limit, offset) {
    return await this.parcelRepository.fetchTrackingNumbers(where, limit, offset);
  }

  /**
   * 只获取未收集的包裹数据
   * @param options
   */
  async fetchTrackingNumbersNotCollected(where, limit) {
    return await this.parcelRepository.fetchTrackingNumbersNotCollected(where, limit);
  }

  /**
   * 根据条件获取包裹号
   * @param where
   * @param limit
   * @param offset
   * @param order
   */
  async fetchTrackingNumberByWhere(where, limit, offset, order?: 'ASC' | 'DESC'): Promise<string[]> {
    const parcels = await this.parcelRepository.fetchTrackingNumbers(where, limit, offset, order);
    return parcels.map(parcel => parcel.trackingNumber);
  }

  /**
   * 找出速运的非创建、送达状态的不活跃包裹
   */
  async findExpressInactiveTrackingNumber() {
    return await this.parcelRepository.findExpressInactiveTrackingNumber();
  }

  /**
   * 导入外部包裹
   *
   * @param outsideParcelDtoArray
   */
  async saveOutsideParcel(outsideParcelDtoArray: OutsideParcelDto[]) {
    const channelOutsideParcelArrayMap = _.chain(outsideParcelDtoArray)
      .uniqWith(_.isEqual)
      .groupBy('channel')
      .value();
    const parcelArray = [];

    for (const channelCode of Object.keys(channelOutsideParcelArrayMap)) {
      // 测试过此处，同一个service内调用也可以走缓存
      const channel: CamChannel = await this.findChannelByCode(channelCode);
      if (!channel) {
        continue;
      }

      let identifications = [];
      // 通过派送商获取 lastProvider
      let transportLastmileProvider: string;
      if (channel.transporterId === 'CMS_TRACK') {
        // 防止包裹循环查询
        identifications = await this.lastmileProviderIdentificationService.findRedis();
      } else {
        const transportRedis = await this.transporterService.findTransporterRedis(channel.transporterId);
        transportLastmileProvider = transportRedis?.lastmileProvider;
      }

      for (const outsideParcel of channelOutsideParcelArrayMap[channelCode]) {
        // CMS_TRACK 通过单号识别规则识别尾程派送商
        let lastmileProviderIdentify: string;
        if (channel.transporterId === 'CMS_TRACK') {
          lastmileProviderIdentify =
            this.lastmileProviderIdentificationService.getLastmileProvider(
              outsideParcel.trackingNumber,
              identifications,
            ) || 'UNKNOWN';
        }

        const parcel = <Parcel>outsideParcel;
        parcel.transporter = channel.transporterId;
        parcel.platform = channel.platform;
        parcel.transporterAccountId = channel.account;
        parcel.apiVersion = 'v2';
        parcel.insuranceValue = 0;
        parcel.status = 'CREATED';
        parcel.declaredAt = parcel.declaredAt ? moment(parcel.declaredAt).toDate() : new Date();
        parcel.productCode = channel.productInfo.productCode;
        parcel.lastmileProvider = transportLastmileProvider || lastmileProviderIdentify;
        parcelArray.push(parcel);
      }
    }
    const successResult = [];
    for (const chunkParcelArray of _.chunk(parcelArray, 500)) {
      const result = await this.parcelRepository.importOutsideParcelOrIgnore(chunkParcelArray);
      const insertSuccessId = _.chain(result.identifiers)
        .filter(it => it)
        .map('id')
        .value();
      if (insertSuccessId.length !== chunkParcelArray.length) {
        const insertSuccessParcel = await this.parcelRepository.find({
          select: [
            'id',
            'trackingNumber',
            'shippingNumber',
            'channel',
            'transporter',
            'platform',
            'transporterAccountId',
            'apiVersion',
            'insuranceValue',
            'status',
            'declaredAt',
            'productCode',
            'createdAt',
            'updatedAt',
            'isArrived',
            'isLost',
            'sync',
          ],
          where: {
            id: In(insertSuccessId),
          },
        });
        const insertSuccessTrackingNumber = _.map(insertSuccessParcel, 'trackingNumber');
        const ignoreTrackingNumber = _.chain(chunkParcelArray)
          .map('trackingNumber')
          .without(...insertSuccessTrackingNumber)
          .value();
        // const content =
        //   `**<font color="#E581D4">外部导入包裹失败</font>**\n\n ` +
        //   `* 平台： ${chunkParcelArray[0].platform}\n` +
        //   `* 派送商： ${chunkParcelArray[0].transporter}\n` +
        //   `* 单号： ${ignoreTrackingNumber.join(',')}\n` +
        //   `* 错误原因: 单号重复`;
        // this.xPushService.sendDingDing(content, 'tracking').then();
        successResult.push(...insertSuccessParcel);
      } else {
        successResult.push(...chunkParcelArray);
      }
    }
    return successResult;
  }

  /**
   * 导入外部账号包裹
   */
  async saveOutsideExternalParcel(parcelArray: OutsideExternalParcelDto[], platform) {
    const identifications = await this.lastmileProviderIdentificationService.findRedis();
    for (const chunkParcelArray of _.chunk(parcelArray, 500)) {
      chunkParcelArray.forEach(parcel => {
        let lastmileProvider = parcel.lastmileProvider;
        let transporter = parcel.lastmileProvider;

        if (lastmileProvider === 'UNKNOWN') {
          lastmileProvider =
            this.lastmileProviderIdentificationService.getLastmileProvider(parcel.trackingNumber, identifications) ||
            'UNKNOWN';
          transporter = 'CMS_TRACK';
        }
        parcel.transporter = transporter;
        parcel.platform = platform;
        parcel.transporterAccountId = 'EXTERNAL_ACCOUNT';
        parcel.apiVersion = 'v2';
        parcel.insuranceValue = 0;
        parcel.status = 'CREATED';
        parcel.declaredAt = parcel.declaredAt ? moment(parcel.declaredAt).toDate() : new Date();
        parcel.lastmileProvider = lastmileProvider;
      });
      await this.parcelRepository.importOutsideParcelOrIgnore(chunkParcelArray);
    }
  }

  @Cacheable({ cacheKey: args => `CMS_CHANNEL_${args[0]}`, ttlSeconds: CacheTtlSeconds.ONE_WEEK })
  async findChannelByCode(code) {
    return this.channelRepository.findOne({ where: { code }, relations: ['productInfo'] });
  }
}
