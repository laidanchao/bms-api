import { Module } from '@nestjs/common';
import { AverageParcelAgingController } from '@/application/srs/average-parcel-aging.controller';
import { DashboardController } from '@/application/srs/dashboard.controller';
import { QuantityDistributionController } from '@/application/srs/quantity-distribution.controller';
import { SrsModule } from '@/domain/srs/srs.module';

@Module({
  imports: [SrsModule],
  controllers: [AverageParcelAgingController, DashboardController, QuantityDistributionController],
})
export class SrsApplicationModule {}
