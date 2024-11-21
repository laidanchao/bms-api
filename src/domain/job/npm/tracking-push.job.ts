import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { getRepository, In } from 'typeorm';
import TrackingPushLog, { TrackingPushStatus } from '@/domain/npm/tracking-push/entities/tracking-push-log.entity';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import _ from 'lodash';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { EventService } from '@/domain/sct/core/service/event.service';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 主动推送物流轨迹
 */
@Injectable()
export class TrackingPushJob extends NormalJob {
  constructor(
    private xPushService: XPushService,
    private trackingEventService: EventService,
    private trackingHandlerService: TrackingHandlerService,
    private myKafkaService: MyKafkaService,
  ) {
    super();
  }

  async handle(): Promise<any> {
    const trackingPushes = await getRepository(TrackingPush).find({
      enabled: true,
    });

    // 获取前500条待推送轨迹
    const needSyncTracking = await getRepository(TrackingPushLog).find({
      where: {
        status: TrackingPushStatus.READY,
      },
      take: 500,
      order: {
        id: 'ASC',
      },
    });

    try {
      // 按不同平台推送
      const groupTracking1 = _.groupBy(needSyncTracking, 'platform');
      for (const platform in groupTracking1) {
        const { kafkaTopic } = trackingPushes.find(f => f.platform === platform);
        const groupTracking2 = _.groupBy(groupTracking1[platform], 'clientId');

        for (const clientId in groupTracking2) {
          // 轨迹排序
          const sortedTracking = _.orderBy(
            groupTracking2[clientId],
            ['trackingNumber', 'timestamp', 'event'],
            ['asc', 'asc', 'desc'],
          );
          const body = {
            trackingArray: sortedTracking.map(m => ({
              trackingNumber: m.trackingNumber,
              reference: m.reference,
              event: m.event,
              description: m.description,
              timestamp: m.timestamp,
              location: m.location,
              fileName: m.fileName,
              fromFile: m.fromFile,
            })),
            platform,
            clientId,
          };
          await this.myKafkaService.kafkaEnqueue(kafkaTopic, body);
        }
      }

      // 更新推送状态
      const ids = needSyncTracking.map(m => m.id);
      const queryBuilder = getRepository(TrackingPushLog).createQueryBuilder();
      await queryBuilder
        .update(TrackingPushLog)
        .set({
          status: TrackingPushStatus.SUCCESS,
          pushedAt: () => 'NOW()',
          pushedTimeDifference: () => `EXTRACT(EPOCH FROM (NOW() - timestamp)) / 60`,
        })
        .whereInIds(ids)
        .execute();
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService.sendDingDing(`TrackingSyncJob 出现异常，异常信息: ${e.message}|${e.stack}`, 'tracking').then();
    }
  }
}
