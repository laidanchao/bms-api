import { Injectable } from '@nestjs/common';
import { NormalJob } from '@/domain/job/base/normal.job';
import { DashboardService } from '@/domain/srs/dashboard/service/dashboard.service';

/**
 * 更新dashboard数据
 */
@Injectable()
export class DashboardJob extends NormalJob {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  async handle(option?): Promise<any> {
    await this.dashboardService.updateDashBoardData();
  }
}
