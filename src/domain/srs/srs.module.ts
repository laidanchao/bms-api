import { Module } from '@nestjs/common';
import { AverageParcelAgingModule } from '@/domain/srs/average-parcel-aging/average-parcel-aging.module';
import { QuantityDistributionModule } from '@/domain/srs/quantity-distribution/quantity-distribution.module';
import { DashboardModule } from '@/domain/srs/dashboard/dashboard.module';

@Module({
  imports: [AverageParcelAgingModule, QuantityDistributionModule, DashboardModule],
  exports: [AverageParcelAgingModule, QuantityDistributionModule, DashboardModule],
})
export class SrsModule {}
