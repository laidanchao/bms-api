import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelAging } from '@/domain/ord/parcel-aging/entities/parcel-aging.entity';
import { ParcelAgingService } from '@/domain/ord/parcel-aging/parcel-aging.service';
import { ParcelAgingRepository } from '@/domain/ord/parcel-aging/parcel-aging.repository';
import { XPushModule } from '@/domain/external/xpush/x-push.module';
import { ChannelModule } from '@/domain/cam/channel/channel.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParcelAging, ParcelAgingRepository]), XPushModule, ChannelModule],
  providers: [ParcelAgingService],
  exports: [ParcelAgingService],
})
export class ParcelAgingModule {}
