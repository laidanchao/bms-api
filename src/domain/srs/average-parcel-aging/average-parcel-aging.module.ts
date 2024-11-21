import { Module } from '@nestjs/common';
import { AverageParcelAgingService } from '@/domain/srs/average-parcel-aging/service/average-parcel-aging.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AverageParcelAgingRepository } from '@/domain/srs/average-parcel-aging/repository/average-parcel-aging.repository';

@Module({
  providers: [AverageParcelAgingService],
  imports: [TypeOrmModule.forFeature([AverageParcelAgingRepository])],
  exports: [AverageParcelAgingService],
})
export class AverageParcelAgingModule {}
