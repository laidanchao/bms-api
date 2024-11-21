import { Module } from '@nestjs/common';
import { CrawlerConfigController } from '@/application/sct/crawler-config.controller';
import { CrawlerPlanController } from '@/application/sct/crawler-plan.controller';
import { CrawlerTargetController } from '@/application/sct/crawler-target.controller';
import { EventController } from '@/application/sct/event.controller';
import { FileRecordController } from '@/application/sct/fileRecord.controller';
import { Track17Controller } from '@/application/sct/track17.controller';
import { TrackingController } from '@/application/sct/tracking.controller';
import { SctModule } from '@/domain/sct/sct.module';
import { AwsModule } from '@/domain/external/aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { InternalMonitorController } from '@/application/sct/internal-monitor.controller';
import { eventStatusDescController } from '@/application/sct/eventStatusDesc.controller';
import { WebhookSettingController } from '@/application/sct/webhookSetting.controller';
import { TrackingMonitorController } from '@/application/sct/tracking-monitor.controller';
import { FtpSettingController } from '@/application/sct/ftp-setting.controller';
import { CrawlerTargetManualController } from '@/application/sct/crawler-target-manual.controller';
import { Track17EventController } from '@/application/sct/track17-event.controller';
import { CmsEventController } from '@/application/sct/cms-event.controller';

@Module({
  imports: [SctModule, AwsModule, ConfigModule],
  controllers: [
    CrawlerConfigController,
    CrawlerPlanController,
    CrawlerTargetController,
    EventController,
    Track17EventController,
    CmsEventController,
    FileRecordController,
    Track17Controller,
    TrackingController,
    InternalMonitorController,
    eventStatusDescController,
    WebhookSettingController,
    TrackingMonitorController,
    FtpSettingController,
    CrawlerTargetManualController,
  ],
})
export class SctApplicationModule {}
