import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { TrackingMonitorService } from '@/domain/sct/core/service/tracking-monitor.service';
import moment from 'moment';

/**
 * 生成轨迹监控数据 一天一行数据
 * 每天utc时间 12:30 生成当天数据
 * 每天utc时间 0:30 更新前一天数据
 */
@Injectable()
export class TrackingMonitorDataJob extends NormalJob {
  constructor(private readonly trackingMonitorService: TrackingMonitorService) {
    super();
  }

  protected async handle(option?): Promise<any> {
    if (option && option.type === 'INSERT_DATA') {
      const date = option?.date || moment().format('YYYY-MM-DD');
      await this.trackingMonitorService.insetTrackingMonitor(date);
    }
    if (option && option.type === 'UPDATE_DATA') {
      const refreshDate =
        option?.date ||
        moment()
          .subtract(1, 'day')
          .format('YYYY-MM-DD');
      await this.trackingMonitorService.refreshTrackingMonitor(refreshDate);
    }
  }
}
