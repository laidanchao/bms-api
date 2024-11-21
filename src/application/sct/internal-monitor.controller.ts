import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { InternalMonitor } from '@/domain/sct/core/entity/internal-monitor.entity';
import { InternalMonitorService } from '@/domain/sct/core/service/internal-monitor.service';

@Crud({
  model: {
    type: InternalMonitor,
  },
})
@ApiBearerAuth()
@ApiTags('internalMonitor')
@Controller('/api/cms/internalMonitor')
export class InternalMonitorController {
  @Inject()
  service: InternalMonitorService;

  /**
   * 刷新监控数据
   * @param body
   */
  @Post('refreshMonitor')
  async refreshMonitorData(@Body() body) {
    return await this.service.refreshInternalMonitorData(body.date, body.id);
  }

  @Post('getInternalMonitor')
  async getInternalMonitorData(@Body() body) {
    return await this.service.getInternalMonitorData(body?.date);
  }

  /**
   * 漏推轨迹补退
   * @param body
   */
  @Post('trackingExtension')
  async trackingExtension(@Body() body) {
    return await this.service.trackingExtension(body.date);
  }

  /**
   * 新增或更新更新当前日期的备注
   * @param body.date
   * @param body.date
   */
  @Post('addNote')
  async addMonitorNote(@Body() body) {
    return await this.service.addNote(body.date, body.note);
  }
}
