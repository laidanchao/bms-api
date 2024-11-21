import { Module } from '@nestjs/common';
import { EventPushRequestController } from '@/application/npm/event-push-request.controller';
import { TrackingPushController } from '@/application/npm/tracking-push.controller';
import { NpmModule } from '@/domain/npm/npm.module';
import { ParcelPushController } from '@/application/npm/parcel-push.controller';
import { EventPushTaskController } from '@/application/npm/event-push-task.controller';

@Module({
  imports: [NpmModule],
  controllers: [EventPushRequestController, EventPushTaskController, TrackingPushController, ParcelPushController],
})
export class NpmApplicationModule {}
