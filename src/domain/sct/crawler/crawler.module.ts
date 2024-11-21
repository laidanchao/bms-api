import { Module } from '@nestjs/common';
import { CrawlerTargetService } from '@/domain/sct/crawler/service/crawler-target.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerTargetRepository } from '@/domain/sct/crawler/repository/crawler-target.repository';
import { CrawlerPlan } from '@/domain/sct/crawler/entity/crawler-plan.entity';
import { CrawlerTarget } from '@/domain/sct/crawler/entity/crawler-target.entity';
import { CrawlerPlanRepository } from '@/domain/sct/crawler/repository/crawler-plan.repository';
import { CrawlerPlanService } from '@/domain/sct/crawler/service/crawler-plan.service';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { CrawlerConfigService } from '@/domain/sct/crawler/service/crawler-config.service';
import { CrawlerConfig } from '@/domain/sct/crawler/entity/crawler-config.entity';
import { ExternalModule } from '@/domain/external/external.module';
import { AccountModule } from '@/domain/cam/account/account.module';
import { CrawlerService } from '@/domain/sct/crawler/service/crawler.service';
import { TrackingBrokerAdapter } from '../core/adapter/tracking-broker-adapter';
import { CmsEvent } from '@/domain/sct/core/entity/cms-event.entity';
import { TrackingRepository } from '@/domain/sct/core/repository/tracking.repository';
import { EventService } from '@/domain/sct/core/service/event.service';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { CmsEventService } from '@/domain/sct/core/service/cms-event.service';
import { EventRepository } from '@/domain/sct/core/repository/event.repository';
import { ClientModule } from '@/domain/sci/transporter/broker/client.module';
import { TrackingInsertService } from '@/domain/sct/core/service/tracking-insert.service';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { ParcelPushRequestService } from '@/domain/npm/parcel-push/service/parcel-push-request.service';
import { ParcelPushRequestRepository } from '@/domain/npm/parcel-push/repository/parcel-push-request.repository';
import { ParcelRepository } from '@/domain/ord/parcel/repository/parcel.repository';
import { CamChannel } from '@/domain/cam/channel/entities/channel.entity';
import { ParcelAgingModule } from '@/domain/ord/parcel-aging/parcel-aging.module';
import { CrawlerController } from '@/application/sct/crawler.controller';
import { CrawlerTargetManual } from '@/domain/sct/core/entity/crawler-target-manual.entity';
import { TransporterModule } from '@/domain/sci/transporter/transporter.module';
import { LastmileProviderModule } from '@/domain/sci/lastmile-provider/lastmile-provider.module';

@Module({
  providers: [
    CrawlerPlanService,
    CrawlerTargetService,
    CrawlerConfigService,
    CrawlerService,
    TrackingBrokerAdapter,
    TrackingHandlerService,
    TrackingHandlerNewService,
    EventService,
    CmsEventService,
    TrackingInsertService,
    ParcelExtendService,
    ParcelPushRequestService,
  ],
  imports: [
    TypeOrmModule.forFeature([
      CrawlerPlan,
      CrawlerTarget,
      CrawlerConfig,
      CrawlerPlanRepository,
      CrawlerTargetRepository,
      CmsEvent,
      TrackingRepository,
      EventRepository,
      ParcelPushRequestRepository,
      ParcelRepository,
      CamChannel,
      CrawlerTargetManual,
    ]),
    AwsModule,
    ConfigModule,
    ExternalModule,
    AccountModule,
    ClientModule,
    ParcelAgingModule,
    TransporterModule,
    LastmileProviderModule,
  ],
  controllers: [CrawlerController],
  exports: [CrawlerTargetService, CrawlerConfigService, CrawlerPlanService, CrawlerService],
})
export class CrawlerModule {}
