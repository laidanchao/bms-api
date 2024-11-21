import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ParcelAging } from '@/domain/ord/parcel-aging/entities/parcel-aging.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParcelAgingRepository } from '@/domain/ord/parcel-aging/parcel-aging.repository';
import { Moment } from '@softbrains/common-utils';
import _ from 'lodash';
import moment from 'moment';
import { Cacheable } from 'type-cacheable';
import { CacheTtlSeconds } from '@/domain/external/cache/cache.service';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { ChannelService } from '@/domain/cam/channel/channel.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Injectable()
export class ParcelAgingService extends TypeOrmCrudService<ParcelAging> {
  constructor(
    @InjectRepository(ParcelAgingRepository) private parcelAgingRepository: ParcelAgingRepository,
    private readonly channelService: ChannelService,
    private readonly xPushService: XPushService,
  ) {
    super(parcelAgingRepository);
  }

  async bulkInsertParcelAging(parcelAgings) {
    await this.parcelAgingRepository.bulkInsert(parcelAgings);
  }

  async fetchAverageParcelAging(date: string, target: string) {
    const startDate = moment(`${date} 00:00:00 +00`, 'YYYY-MM-DD HH-mm-ss ZZ').toDate();
    const endDate = moment(`${date} 23:59:59 +00`, 'YYYY-MM-DD HH-mm-ss ZZ').toDate();
    return await this.parcelAgingRepository.fetchAverageParcelAging(startDate, endDate, target);
  }

  async computeParcelAging(parcels) {
    const channelMap = await this.getChannelMap();
    try {
      const parcelAgingArray = await this.buildParcelAging(parcels, channelMap);
      await this.bulkInsertParcelAging(parcelAgingArray);
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      const trackingNumbers = parcels.map(m => m.trackingNumber);
      this.xPushService.sendDingDing(`计算时效出现异常，异常信息: ${e.message},${trackingNumbers.toString()}`).then();
    }
  }

  @Cacheable({
    ttlSeconds: CacheTtlSeconds.ONE_WEEK,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cacheKey: args => `CMS_PARCEL_AGING_CHANNEL_MAP`,
  })
  public async getChannelMap() {
    const channels = await this.channelService.find({
      select: [
        'id',
        'code',
        'transporterId',
        'isActive',
        'isSupportMulti',
        'isSupportInsurance',
        'isUploadS3',
        'platform',
        'account',
        'ftlRoute',
      ],
      relations: ['productInfo'],
    });
    return _.reduce(
      channels.filter(channel => !!channel.productInfo),
      (result, channel) => {
        const productCode = channel.productInfo.productCode;
        const channelCode = channel.code;
        result[channelCode] = productCode;
        return result;
      },
      {},
    );
  }

  private async buildParcelAging(parcels: Parcel[], channelMap) {
    return _.map(parcels, parcel => {
      const data = ParcelAgingPolicy.computeAging(parcel.declaredAt, parcel.transferredAt, parcel.arrivedAt);
      const { arrivedAging, transferredAtIsSunday, arrivedAtIsSunday, transferredAging } = data;
      return {
        updatedAt: new Date(),
        platform: parcel.platform,
        arrivedAt: parcel.arrivedAt,
        arrivedAging: _.round(arrivedAging, 3) || null,
        arrivedAtIsSunday,
        channel: parcel.channel,
        productCode: channelMap[parcel.channel],
        parcelCreatedAt: parcel.declaredAt,
        sourceDeliveryAging: parcel.aging,
        status: parcel.status,
        trackingNumber: parcel.trackingNumber,
        transferredAging: _.round(transferredAging, 3) || null,
        transferredAt: parcel.transferredAt,
        transferredAtIsSunday,
        transferredEtaAging: null,
        transporterAccountId: parcel.transporterAccountId,
        transporterId: parcel.transporter,
      };
    });
  }
}

export class ParcelAgingPolicy {
  static computeAging(declaredAt, transferredAt, arrivedAt): any {
    const transferredAging = ParcelAgingPolicy.computeTimeDiffExcludeHoliday(declaredAt, transferredAt);
    const arrivedAging = ParcelAgingPolicy.computeTimeDiffExcludeHoliday(transferredAt, arrivedAt);
    return {
      transferredAging,
      arrivedAging,
      transferredAtIsSunday: ParcelAgingPolicy.judgeHolidays(transferredAt),
      arrivedAtIsSunday: ParcelAgingPolicy.judgeHolidays(arrivedAt),
    };
  }

  static computeTimeDiffExcludeHoliday(earlierTime, laterTime) {
    const holidayList = ParcelAgingPolicy.getHolidayList(earlierTime, laterTime);
    if (holidayList && holidayList.length) {
      let earlierMoment = Moment(earlierTime).tz('Europe/Paris');
      let laterMoment = Moment(laterTime).tz('Europe/Paris');
      if (holidayList[0]) {
        earlierMoment = earlierMoment.endOf('day');
      }
      if (holidayList[holidayList.length - 1]) {
        laterMoment = laterMoment.startOf('day');
      }
      const day = ParcelAgingPolicy.getTimeDiffAsDay(earlierMoment.toDate(), laterMoment.toDate());
      // 去掉头和尾, 减去中间的天数
      const hd = holidayList.slice(1, holidayList.length - 1);
      const sundayNumber = hd.filter(item => !!item).length;
      return day - sundayNumber > 0 ? day - sundayNumber : 0;
    }
  }

  static getHolidayList(startDate, endDate) {
    const dateRange = ParcelAgingPolicy.getDateRange(startDate, endDate, 'day');
    return _.map(dateRange, item => {
      return ParcelAgingPolicy.judgeHolidays(item);
    });
  }

  static judgeHolidays(date, holidays = []) {
    return (
      Moment(date)
        .tz('Europe/Paris')
        .day() === 0 || holidays.includes(date)
    );
  }

  // 计算时间差值
  static getTimeDiffAsDay(start, end) {
    const diff = end.getTime() - start.getTime();
    const agingOfDay = Moment.duration(diff, 'ms').asDays();
    return _.round(agingOfDay, 3);
  }

  static getDateRange(startDate, endDate, interval) {
    startDate = moment(startDate).tz('Europe/Paris');
    endDate = moment(endDate).tz('Europe/Paris');
    const dataRangeArray = [];
    while (moment(startDate).isSameOrBefore(endDate, interval)) {
      dataRangeArray.push(startDate);
      startDate = moment(startDate).add(1, interval);
    }
    return dataRangeArray;
  }
}
