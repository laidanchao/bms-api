import { Module } from '@nestjs/common';
import { EventService } from '@/domain/sct/core/service/event.service';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalModule } from '@/domain/external/external.module';
import { EventRepository } from '@/domain/sct/core/repository/event.repository';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { TrackingBrokerAdapter } from '@/domain/sct/core/adapter/tracking-broker-adapter';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { TransporterModule } from '@/domain/sci/transporter/transporter.module';
import { ParcelPushModule } from '@/domain/npm/parcel-push/parcel-push.module';
import { CrawlerModule } from '@/domain/sct/crawler/crawler.module';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '@/domain/cam/account/account.module';
import { InternalMonitorService } from '@/domain/sct/core/service/internal-monitor.service';
import { InternalMonitor } from '@/domain/sct/core/entity/internal-monitor.entity';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { EventStatusDescService } from '@/domain/sct/core/service/eventStatusDesc.service';
import { EventStatusDesc } from '@/domain/sct/core/entity/eventStatusDesc.entity';
import { CmsEventService } from '@/domain/sct/core/service/cms-event.service';
import { CmsEvent } from '@/domain/sct/core/entity/cms-event.entity';
import { WebhookModule } from '@/domain/sct/webhook/webhook.module';
import { TrackingMonitorService } from '@/domain/sct/core/service/tracking-monitor.service';
import { TrackingMonitor } from '@/domain/sct/core/entity/tracking-monitor.entity';
import { TrackingInsertService } from '@/domain/sct/core/service/tracking-insert.service';
import { CrawlerTargetManualService } from '@/domain/sct/core/service/crawler-target-manual.service';
import { CrawlerTargetManual } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { CrawlerTargetManualRepository } from '@/domain/sct/core/repository/crawler-target-manual.repository';
import { Track17EventService } from '@/domain/sct/core/service/track17-event.service';
import { Track17Event } from '@/domain/sct/webhook/entity/track17-event.entity';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { ParcelPushRequestRepository } from '@/domain/npm/parcel-push/repository/parcel-push-request.repository';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { ParcelAgingModule } from '@/domain/ord/parcel-aging/parcel-aging.module';
import { LastmileProviderModule } from '@/domain/sci/lastmile-provider/lastmile-provider.module';
import { SystemVariableModule } from '@/domain/base/ssm/system/system-variable.module';

@Module({
  providers: [
    EventService,
    EventStatusDescService,
    TrackingHandlerService,
    TrackingHandlerNewService,
    TrackingService,
    TrackingBrokerAdapter,
    CmsEventService,
    InternalMonitorService,
    TrackingMonitorService,
    TrackingInsertService,
    CrawlerTargetManualService,
    Track17EventService,
    ParcelExtendService,
    ParcelPushRequestService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      TrackingRepository,
      EventRepository,
      EventStatusDesc,
      CmsEvent,
      InternalMonitor,
      TrackingMonitor,
      CrawlerTargetManual,
      CrawlerTargetManualRepository,
      Track17Event,
      ParcelPushRequestRepository,
      ParcelRepository,
      CamChannel,
    ]),
    ExternalModule,
    ClientModule,
    TransporterModule,
    ParcelPushModule,
    CrawlerModule,
    ConfigModule,
    AccountModule,
    AwsModule,
    WebhookModule,
    SystemVariableModule,
    ParcelAgingModule,
    LastmileProviderModule,
  ],
  exports: [
    EventService,
    EventStatusDescService,
    TrackingService,
    TrackingHandlerService,
    TrackingHandlerNewService,
    TrackingBrokerAdapter,
    CmsEventService,
    InternalMonitorService,
    TrackingMonitorService,
    CrawlerTargetManualService,
    Track17EventService,
  ],
})
export class CoreModule {}
