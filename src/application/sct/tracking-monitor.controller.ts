import { TrackingMonitor } from '@/domain/sct/core/entity/tracking-monitor.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { TrackingMonitorService } from '@/domain/sct/core/service/tracking-monitor.service';
import { getRepository } from 'typeorm';
import moment from 'moment';

@Crud({
  model: {
    type: TrackingMonitor,
  },
})
@ApiBearerAuth()
@ApiTags('TrackingMonitor')
@Controller('/api/cms/trackingMonitor')
export class TrackingMonitorController {
  @Inject()
  private service: TrackingMonitorService;

  // 每天12：30 生成当天数据
  @Post('insetTrackingMonitor')
  async genTrackingMonitor(@Body() body) {
    return await this.service.insetTrackingMonitor(body.date);
  }

  // 第二天 凌晨更新前一天的数据
  @Post('refreshTrackingMonitor')
  async refreshTrackingMonitor(@Body() body) {
    const refreshDate = moment(body.date)
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    return await this.service.refreshTrackingMonitor(refreshDate);
  }
}
