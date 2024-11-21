import { Module } from '@nestjs/common';
import { EventPushModule } from '@/domain/npm/event-push/event-push.module';
import { TrackingPushModule } from '@/domain/npm/tracking-push/tracking-push.module';
import { ParcelPushModule } from '@/domain/npm/parcel-push/parcel-push.module';

@Module({
  imports: [EventPushModule, ParcelPushModule, TrackingPushModule],
  exports: [EventPushModule, ParcelPushModule, TrackingPushModule],
})
export class NpmModule {}
