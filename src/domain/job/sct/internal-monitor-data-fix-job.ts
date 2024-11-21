import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { InternalMonitorService } from '@/domain/sct/core/service/internal-monitor.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import moment from 'moment';

/**
 * 内部监控数据补充
 */
@Injectable()
export class InternalMonitorDataFixJob extends NormalJob {
  constructor(
    private readonly internalMonitorService: InternalMonitorService,
    private readonly xPushService: XPushService,
  ) {
    super();
  }

  protected async handle(option?): Promise<any> {
    const date = option?.date || new Date();
    const dateFormat = moment(date)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');

    try {
      await this.internalMonitorService.trackingExtension(dateFormat);
    } catch (e) {
      this.xPushService.sendDingDing('内部监控过数据补充失败：' + e.message, 'tracking', null, true).then();
    }
  }
}
