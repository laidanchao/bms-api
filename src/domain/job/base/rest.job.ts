import { Logger } from '@nestjs/common';
import _ from 'lodash';
import { JobInterface } from '@/domain/job/base/job.interface';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';

export abstract class RestJob extends JobInterface {
  config: Record<string, any>;
  parcelRepository: ParcelRepository;
  trackingService: TrackingService;

  protected constructor(
    parcelRepository: ParcelRepository,
    trackingService: TrackingService,
  ) {
    super();
    // do nothing
    this.trackingService = trackingService;
    this.parcelRepository = parcelRepository;
  }

  async getTrackingAndDealWithParcel(
    parcels,
    getRemoteTrackings: (options?: any) => Promise<any[]>,
    processParcelWithPolicy: (parcel, tracking) => void,
    isBatch: boolean | true,
  ) {
    try {
      if (isBatch) {
        await this.batchGetTrackingAndDealWithParcel(parcels, getRemoteTrackings, processParcelWithPolicy);
      } else {
        await this.singleGetTrackingAndDealWithParcel(parcels, getRemoteTrackings, processParcelWithPolicy);
      }
    } catch (e) {
      Logger.error(e.message);
    }
  }

  async batchGetTrackingAndDealWithParcel(
    parcels,
    getRemoteTrackings: (options?: any) => Promise<any[]>,
    processParcelWithPolicy: (parcel, tracking) => void,
  ) {
    try {
      const remoteTrackings = await getRemoteTrackings(parcels);
      const trackingGrouped = _.groupBy(remoteTrackings, 'trackingNumber');
      for (const parcel of parcels) {
        this.logProgress(parcel, parcels, parcel.trackingNumber);
        const trackings = trackingGrouped[parcel.trackingNumber];
        if (trackings && trackings.length) {
          const copyOfParcel = _.cloneDeep(parcel);
          for (const tracking of trackings) {
            //save last Event, last Description, last Timestamps
            if (parcel) {
              parcel.lastEvent = tracking.event;
              parcel.lastDescription = tracking.description;
              parcel.lastTimestamps = tracking.timestamp;
              processParcelWithPolicy(parcel, tracking);
            }
          }
          //save trackings
          await this.trackingService.bulkInsert(<Tracking[]>trackings);
          //save parcels
          await this.parcelRepository.updateParcel(parcel, copyOfParcel);
        }
      }
    } catch (e) {
      Logger.error(e.message);
    }
  }

  async singleGetTrackingAndDealWithParcel(
    parcels,
    getRemoteTrackings: (options?: any) => Promise<any[]>,
    processParcelWithPolicy: (parcel, tracking) => void,
  ) {
    try {
      for (const parcel of parcels) {
        this.logProgress(parcel, parcels, parcel.trackingNumber);
        const trackings = await getRemoteTrackings(parcel);
        if (trackings && trackings.length) {
          const copyOfParcel = _.cloneDeep(parcel);
          for (const tracking of trackings) {
            //save last Event, last Description, last Timestamps
            if (parcel) {
              parcel.lastEvent = tracking.event;
              parcel.lastDescription = tracking.description;
              parcel.lastTimestamps = tracking.timestamp;
              processParcelWithPolicy(parcel, tracking);
            }
          }
          //save trackings
          await this.trackingService.bulkInsert(<Tracking[]>trackings);
          //save parcels
          await this.parcelRepository.updateParcel(parcel, copyOfParcel);
        }
      }
    } catch (e) {
      Logger.error(e.message);
    }
  }

  protected logProgress(current, array, message) {
    const index = _.findIndex(array, parcel => parcel.trackingNumber === current.trackingNumber);
    Logger.log(`handling ${this.constructor.name} ${message} ${index + 1}/${array.length}`);
  }

  // 钉钉机器人发送执行失败提示
  private async notifiedByDingRobot() {
    // do nothing
  }

  // 邮件发送执行结果详情
  private async sendEmail() {
    // do nothing
  }
}
