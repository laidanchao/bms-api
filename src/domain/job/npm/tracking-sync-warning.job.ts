import { NormalJob } from '@/domain/job/base/normal.job';
import { Injectable } from '@nestjs/common';
import { getRepository } from 'typeorm';
import TrackingPushLog, { TrackingPushStatus } from '@/domain/npm/tracking-push/entities/tracking-push-log.entity';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';
import _ from 'lodash';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 推送物流轨迹预警
 */
@Injectable()
export class TrackingSyncWarningJob extends NormalJob {
  constructor(private xPushService: XPushService) {
    super();
  }

  async handle(): Promise<any> {
    const trackingPushes = await getRepository(TrackingPush).find({
      enabled: true,
    });

    try {
      const groupLogs = await getRepository(TrackingPushLog)
        .createQueryBuilder('log')
        .where('log.status = :status', { status: TrackingPushStatus.READY })
        .groupBy('log.platform')
        .addGroupBy('log.clientId')
        .select('log.platform', 'platform')
        .addSelect('log.clientId', 'clientId')
        .addSelect('count(log.clientId)', 'quantity')
        .getRawMany();

      // 按平台分组
      const groupPlatformLogs = _.groupBy(groupLogs, 'platform');
      for (const platform in groupPlatformLogs) {
        const platformLogs = groupPlatformLogs[platform];

        const platformLimitConfig = trackingPushes.find(f => f.platform === platform && !f.clientId);
        // 如果对整个平台配置，则以平台为单位发送预警信息
        if (platformLimitConfig) {
          const quantity = _.sumBy(platformLogs, s => {
            return Number(s.quantity);
          });
          if (quantity > platformLimitConfig.warningLimit) {
            const content = `轨迹推送预警：${platform},剩余待推送数量:${quantity},预警数量: ${platformLimitConfig.warningLimit}`;
            this.xPushService.sendDingDing(content, 'tracking').then();
          }
        } else {
          // 如果针对某个客户配置，则以客户为单位发送预警信息
          for (const { clientId, quantity } of platformLogs) {
            const clientLimitConfig = trackingPushes.find(f => f.platform === platform && f.clientId === clientId);
            if (clientLimitConfig && quantity > clientLimitConfig.warningLimit) {
              const content = `轨迹推送预警：${platform},${clientId},剩余待推送数量:${quantity},预警数量: ${clientLimitConfig.warningLimit}`;
              this.xPushService.sendDingDing(content, 'tracking').then();
            }
          }
        }
      }
    } catch (e) {
      console.error(e.message);
      console.error(e.stack);
      this.xPushService.sendDingDing(`TrackingSyncWarningJob 出现异常，异常信息: ${e.message}`, 'tracking').then();
    }
  }
}
