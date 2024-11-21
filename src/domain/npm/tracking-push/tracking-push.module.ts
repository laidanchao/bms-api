import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingPushService } from '@/domain/npm/tracking-push/service/tracking-push.service';
import { TrackingPush } from '@/domain/npm/tracking-push/entities/tracking-push.entity';

@Module({
  providers: [TrackingPushService],
  imports: [TypeOrmModule.forFeature([TrackingPush])],
  exports: [TrackingPushService],
})
export class TrackingPushModule {}
