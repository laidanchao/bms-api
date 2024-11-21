import { Module } from '@nestjs/common';
import { ParcelModule } from '@/domain/ord/parcel/parcel.module';
import { ParcelAgingModule } from '@/domain/ord/parcel-aging/parcel-aging.module';
import { RequestLogModule } from '@/domain/ord/request-log/request-log.module';

@Module({
  imports: [ParcelModule, ParcelAgingModule, RequestLogModule],
  exports: [ParcelModule, ParcelAgingModule, RequestLogModule],
})
export class OrdModule {}
