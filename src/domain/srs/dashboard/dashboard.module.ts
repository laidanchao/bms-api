import { Module } from '@nestjs/common';
import { DashboardService } from '@/domain/srs/dashboard/service/dashboard.service';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  imports: [ExternalModule],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
