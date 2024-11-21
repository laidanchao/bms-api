import { Module } from '@nestjs/common';
import { FuelRateService } from '@/domain/scb/fuel-rate/service/fuel-rate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelRate } from '@/domain/scb/fuel-rate/entities/fuel-rate.entity';

@Module({
  providers: [FuelRateService],
  imports: [TypeOrmModule.forFeature([FuelRate])],
  exports: [FuelRateService],
})
export class FuelRateModule {}
