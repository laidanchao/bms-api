import { Module } from '@nestjs/common';
import { Track17Service } from '@/domain/sct/webhook/service/track17.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track17 } from '@/domain/sct/webhook/entity/track17.entity';
import { Track17RequestService } from '@/domain/sct/webhook/service/track17-request.service';
import { Track17Request } from '@/domain/sct/webhook/entity/track17-request.entity';
import TrackingWebhookLog from '@/domain/sct/webhook/entity/trackingWebhookLog.entity';
import { Track17RequestRepository } from '@/domain/sct/webhook/repository/track17-request.repository';
import { CrawlerModule } from '@/domain/sct/crawler/crawler.module';
import { WebhookSetting } from '@/domain/sct/webhook/entity/webhook-setting.entity';
import { WebhookSettingService } from '@/domain/sct/webhook/service/webhook-setting.service';
import { ExternalModule } from '@/domain/external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Track17, Track17Request, TrackingWebhookLog, Track17RequestRepository, WebhookSetting]),
    CrawlerModule,
    ExternalModule,
  ],
  providers: [Track17Service, Track17RequestService, WebhookSettingService],
  exports: [Track17Service, Track17RequestService, WebhookSettingService],
})
export class WebhookModule {}
