import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import moment from 'moment';

@Injectable()
export class TrackingInsertService {
  constructor(
    @InjectRepository(TrackingRepository) private trackingRepository: TrackingRepository,
  ) {
  }

  async bulkInsert(trackingArray) {
    trackingArray.forEach(tracking => {
      tracking.timeDifference = moment().diff(tracking.timestamp, 'm');
      if (tracking.fromFile) {
        tracking.transporterDelayTime = moment(tracking.getFileTime).diff(tracking.timestamp, 'm');
      }
    });
    const bulkInsertResult = await this.trackingRepository.bulkInsert(trackingArray);

    // 添加待推送轨迹记录
    const insertedIds = bulkInsertResult.filter(result => !!result).map(result => result.id);
    await this.trackingRepository.addSyncTracking(insertedIds);

    return insertedIds;
  }
}
