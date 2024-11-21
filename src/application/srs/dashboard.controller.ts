import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from '@/domain/srs/dashboard/service/dashboard.service';

@ApiBearerAuth()
@ApiTags('Dashboard')
@Controller('/api/cms/dashboard')
export class DashboardController {
  @Inject()
  private service: DashboardService;

  @Get()
  async getDashboardData() {
    return await this.service.getDashboardData();
  }
}
