import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { TrackingBrokerAdapter } from '@/domain/sct/core/adapter/tracking-broker-adapter';
import { EventService } from '@/domain/sct/core/service/event.service';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { ParcelExtendService } from '@/domain/ord/parcel/service/parcelExtend.service';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { WEBHOOK_SOURCE } from '@/domain/sct/webhook/entity/track17-request.entity';

/**
 * 处理新增轨迹的包裹 更新包裹状态
 */
@Injectable()
export class TrackingListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    private trackingBrokerAdapter: TrackingBrokerAdapter,
    private parcelService: ParcelExtendService,
    private trackingEventService: EventService,
    private readonly trackingHandlerService: TrackingHandlerService,
    private myKafkaService: MyKafkaService,
    private trackingService: TrackingService,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('COLICOLI_CMS_TRACKING', this);
    this.kafkaClient.subscribeToResponseOf('CAINIAO_WEBHOOK_TRACKING', this);
    Logger.log('COLICOLI_CMS_TRACKING subscribe success');
    Logger.log('CAINIAO_WEBHOOK_TRACKING subscribe success');
  }

  @SubscribeTo('COLICOLI_CMS_TRACKING')
  async ColicoliTracking(@Payload() data: any) {
    await this.trackingService.webhookTracking(data, null, WEBHOOK_SOURCE.COLICOLI);
  }

  @SubscribeTo('CAINIAO_WEBHOOK_TRACKING')
  async CainiaoTracking(@Payload() data: any) {
    const { body, header } = JSON.parse(data).body;
    await this.trackingService.webhookTracking(body, header, WEBHOOK_SOURCE.CAINIAO);
  }
}
