import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import moment from 'moment';
import { getRepository } from 'typeorm';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { ParcelStatus } from '@/domain/utils/Enums';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { ParcelAgingService } from '@/domain/ord/parcel-aging/parcel-aging.service';

@Injectable()
export class TrackingHandlerNewService {
  constructor(
    private parcelService: ParcelExtendService,
    private crawlerTargetService: CrawlerTargetService,
    private parcelPushRequestService: ParcelPushRequestService,
    private xPushService: XPushService,
    private trackingHandlerService: TrackingHandlerService,
    private parcelAgingService: ParcelAgingService,
  ) {}

  async handleTracking(trackingNumbers: string[], subMonth = 3) {
    if (_.isEmpty(trackingNumbers)) {
      return;
    }

    // 三个月前
    const threeMonthBefore = moment()
      .subtract(subMonth, 'month')
      .format('YYYY-MM-DD');

    // 获取创建时间为3个月内的包裹和轨迹
    const allParcelArray = await getRepository(Parcel)
      .createQueryBuilder('parcel')
      .leftJoinAndMapMany(
        'parcel.trackings',
        Tracking,
        'tracking',
        `parcel.trackingNumber = tracking.trackingNumber and tracking.createdAt > :threeMonthBefore`,
        { threeMonthBefore },
      )
      .where('parcel.trackingNumber in (:...trackingNumbers) and parcel.createdAt > :threeMonthBefore', {
        trackingNumbers,
        threeMonthBefore,
      })
      .orderBy('parcel.createdAt', 'DESC')
      .getMany();

    const parcelArray = _.uniqBy(allParcelArray, 'trackingNumber');
    const updatedParcelArray = [];
    try {
      const trackingHandlePromise = parcelArray.map(async parcel => {
        // 轨迹排序
        const trackingArray = _.orderBy(parcel.trackings, ['timestamp', 'event'], ['asc', 'desc']);
        delete parcel.trackings;
        const originParcel = _.cloneDeep(parcel);
        const newParcel = await this.handleTracing(parcel, trackingArray);
        if (!_.isEqual(originParcel, newParcel)) {
          updatedParcelArray.push(newParcel);
        }
      });
      await Promise.all(trackingHandlePromise);
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService
        .sendDingDing(`handle-tracking-new 出现异常，异常信息: ${e.message},${trackingNumbers.toString()}`, 'tracking')
        .then();
      return;
    }
    await this.parcelService.bulkUpdate(updatedParcelArray, [
      'lastEvent',
      'lastDescription',
      'lastTimestamps',
      'transferredAt',
      'status',
      'arrivedAt',
      'isArrived',
      'isReturned',
      'returnedAt',
      'aging',
      'updatedAt',
      'sync',
      'isAppointed',
      'isFinished',
      'isLost',
    ]);

    await this.parcelPushRequestService.bulkInsert(updatedParcelArray);
    await this.crawlerTargetService.updateCrawlerTarget(updatedParcelArray);
    await this.pushArrivedParcelToParcelAgingJob(updatedParcelArray.filter(parcel => parcel.status === 'ARRIVED'));
  }

  public async handleTracing(parcel, trackingArray) {
    for (let index = 0; index < trackingArray.length; index++) {
      const tracking = trackingArray[index];
      const trackingEvent = await this.trackingHandlerService.findTrackingEvent(tracking, parcel.transporter);

      // REMAINING和CREATED 只更新last相关信息
      if (
        trackingEvent &&
        [ParcelStatus.REMAINING, ParcelStatus.CREATED].includes(trackingEvent.parcelStatus as ParcelStatus)
      ) {
        parcel.lastDescription = tracking.description;
        parcel.lastEvent = tracking.event;
        parcel.lastTimestamps = tracking.timestamp;
        continue;
      }

      // if (trackingEvent && trackingEvent.parcelStatus === ParcelStatus.UNKNOWN) {
      //   const message = `没有为轨迹事件 ${trackingEvent.event} 指定包裹状态。单号${tracking.trackingNumber},派送商${parcel.transporter}`;
      //   Logger.warn(message);
      //   this.xPushService.sendDingDing(message, 'tracking').then();
      // }

      parcel.status = trackingEvent?.parcelStatus || parcel.status;
      parcel.lastDescription = tracking.description;
      parcel.lastEvent = tracking.event;
      parcel.lastTimestamps = tracking.timestamp;

      // 判断上网
      if (
        trackingEvent &&
        trackingEvent.parcelStatus &&
        ![ParcelStatus.CREATED, ParcelStatus.UNKNOWN, ParcelStatus.BEFORE_TRANSIT, ParcelStatus.DELETED].includes(
          trackingEvent.parcelStatus as ParcelStatus,
        )
      ) {
        parcel.transferredAt = this.getEarlierDate(parcel.transferredAt, tracking.timestamp);
      }

      // 判断预约派送
      if (trackingEvent?.parcelStatus === ParcelStatus.APPOINTED) {
        parcel.isAppointed = true;
      } else if (trackingEvent?.parcelStatus === ParcelStatus.ARRIVED) {
        // 判断妥投
        parcel.arrivedAt = this.getEarlierDate(parcel.arrivedAt, tracking.timestamp);
        parcel.aging = _.round(moment.duration(parcel.arrivedAt - parcel.transferredAt, 'ms').asDays(), 1);
        parcel.isArrived = true;
      } else if (trackingEvent?.parcelStatus === ParcelStatus.RETURNED) {
        // 判断退件
        parcel.returnedAt = this.getEarlierDate(parcel.returnedAt, tracking.timestamp);
        parcel.isReturned = true;
      } else if (trackingEvent?.parcelStatus === ParcelStatus.LOST) {
        // 判断丢失
        parcel.isLost = parcel.status === ParcelStatus.LOST;
      }

      // 包裹完结了（不需要轨迹跟踪了）
      if (
        [ParcelStatus.ARRIVED, ParcelStatus.RETURNED, ParcelStatus.STOPPED, ParcelStatus.LOST].includes(parcel.status)
      ) {
        parcel.isFinished = true;
      }
    }
    return parcel;
  }

  private getEarlierDate(d1, d2) {
    if (d1 && d2) {
      return d1 < d2 ? d1 : d2;
    } else {
      return !!d1 ? d1 : d2;
    }
  }

  private async pushArrivedParcelToParcelAgingJob(arrivedParcelArray) {
    for (const chunkArrivedParcelArray of _.chunk(arrivedParcelArray, 1000)) {
      await this.parcelAgingService.computeParcelAging(chunkArrivedParcelArray);
    }
  }
}
