import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuantityDistributionRepository } from '@/domain/srs/quantity-distribution/repository/quantity-distribution.repository';
import { QuantityDistributionService } from '@/domain/srs/quantity-distribution/service/quantity-distribution.service';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuantityDistributionRepository]), ExternalModule],
  providers: [QuantityDistributionService],
  exports: [QuantityDistributionService],
})
export class QuantityDistributionModule {}
