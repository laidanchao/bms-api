import { EntityRepository, getRepository, InsertResult } from 'typeorm';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { BaseRepository } from '@/domain/base/repository/base.repository';
import { Override } from '@nestjsx/crud';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import { Account } from '@/domain/cam/account/entities/account.entity';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { TrackingPushLog, TrackingPushStatus } from '@/domain/npm/tracking-push/entities/tracking-push-log.entity';
import _ from 'lodash';

@EntityRepository(Tracking)
export class TrackingRepository extends BaseRepository<Tracking> {
  @Override()
  async insert(entity: QueryDeepPartialEntity<Tracking> | QueryDeepPartialEntity<Tracking>[]): Promise<InsertResult> {
    const insertResult = await super.insert(entity);
    const insertedIds = insertResult.identifiers.filter(result => !!result).map(result => result.id);
    if (!_.isEmpty(insertedIds)) {
      await this.addSyncTracking(insertedIds);
    }
    return insertResult;
  }

  /**
   * 添加待推送轨迹
   * @param trackingIds
   */
  async addSyncTracking(trackingIds: number[]) {
    if (_.isEmpty(trackingIds)) {
      return;
    }
    const trackingArray = await this.findByIds(trackingIds);
    if (_.isEmpty(trackingArray)) {
      return;
    }

    // 获取轨迹推送配置
    const trackingPushes = await getRepository(TrackingPush).find({ enabled: true });

    // 获取包裹
    const trackingNumbers: string[] = _.chain(trackingArray)
      .map('trackingNumber')
      .uniq()
      .value();
    const parcels = await getRepository(Parcel)
      .createQueryBuilder('parcel')
      .leftJoinAndSelect(Account, 'account', 'parcel.transporterAccountId = account.account')
      .where('parcel.trackingNumber in (:...trackingNumbers)', { trackingNumbers })
      .select('parcel.trackingNumber', 'trackingNumber')
      .addSelect('parcel.platform', 'platform')
      .addSelect('parcel.transporter', 'transporter')
      .addSelect('parcel.transporterAccountId', 'transporterAccountId')
      .addSelect('parcel.clientId', 'clientId')
      .addSelect('account.external', 'external')
      .getRawMany();

    // 拼装待推送轨迹数据
    const trackingPushLogs: TrackingPushLog[] = [];
    for (const parcel of parcels) {
      // 判断是否需要同步：1.配置了该平台 2.配置了该服务商 3.配置了客户或者未配置客户（整个平台都需要）4.是否支持外部账号和包裹对应账号需要匹配
      const needSync = trackingPushes.some(
        s =>
          s.platform === parcel.platform &&
          s.transporterIds.includes(parcel.transporter) &&
          (s.clientId === parcel.clientId || !s.clientId) &&
          (s.includeExternalAccount || (!s.includeExternalAccount && !parcel.external)),
      );
      if (needSync) {
        const needTrackingArray = trackingArray.filter(f => f.trackingNumber === parcel.trackingNumber);

        const entities = needTrackingArray.map(m => {
          return TrackingPushLog.create({
            transporterId: parcel.transporter,
            platform: parcel.platform,
            clientId: parcel.clientId,
            status: TrackingPushStatus.READY,
            trackingNumber: parcel.trackingNumber,
            event: m.event,
            timestamp: m.timestamp,
            description: m.description,
            location: m.location,
            fromFile: m.fromFile,
            fileName: m.fileName,
            trackingId: m.id,
            reference: m.reference,
            getFileTime: m.getFileTime,
            transporterDelayTime: m.transporterDelayTime,
          });
        });

        trackingPushLogs.push(...entities);
      }
    }

    // 保存待推送轨迹数据
    if (!_.isEmpty(trackingPushLogs)) {
      await getRepository(TrackingPushLog).save(trackingPushLogs, { chunk: 500 });
    }
  }
}
