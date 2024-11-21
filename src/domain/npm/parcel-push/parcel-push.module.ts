import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParcelPushRequest } from '@/domain/npm/parcel-push/entity/parcel-push-request.entity';
import { ParcelPushLog } from '@/domain/npm/parcel-push/entity/parcel-push-log.entity';
import { ParcelPush } from '@/domain/npm/parcel-push/entity/parcel-push.entity';
import { ParcelPushService } from './service/parcel-push.service';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { ParcelPushLogService } from './service/parcel-push-log.service';
import { ParcelPushRequestRepository } from '@/domain/npm/parcel-push/repository/parcel-push-request.repository';
import { ParcelPushLogRepository } from './repository/parcel-push-log.repository';

@Module({
  providers: [ParcelPushService, ParcelPushRequestService, ParcelPushLogService],
  imports: [
    TypeOrmModule.forFeature([
      ParcelPushRequest,
      ParcelPushLog,
      ParcelPush,
      ParcelPushRequestRepository,
      ParcelPushLogRepository,
    ]),
  ],
  exports: [ParcelPushService, ParcelPushRequestService, ParcelPushLogService],
})
export class ParcelPushModule {}
