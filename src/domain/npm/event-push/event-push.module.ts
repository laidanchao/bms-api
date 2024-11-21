import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventPushRequest } from '@/domain/npm/event-push/entity/event-push-request.entity';
import { EventPushRequestService } from './service/event-push-request.service';
import { ExternalModule } from '@/domain/external/external.module';
import { CoreModule } from '@/domain/sct/core/core.module';
import { EventPushTaskService } from '@/domain/npm/event-push/service/event-push-task.service';
import { EventPushTask } from '@/domain/npm/event-push/entity/event-push-task.entity';

@Module({
  providers: [EventPushRequestService, EventPushTaskService],
  imports: [TypeOrmModule.forFeature([EventPushRequest, EventPushTask]), ExternalModule, CoreModule],
  exports: [EventPushRequestService, EventPushTaskService],
})
export class EventPushModule {}
