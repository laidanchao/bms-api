import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { ClearedParcelDto } from '@/domain/ord/parcel/dto/cleared-parcel.dto';
import { Tracking } from '@/domain/sct/core/entity/tracking.entity';
import { TrackingHandlerService } from '@/domain/sct/core/service/tracking-handler.service';
import { TrackingService } from '@/domain/sct/core/service/tracking.service';
import { MyKafkaService } from '@/domain/external/microservices/my-kafka.service';
import { getRepository } from 'typeorm';
import { Parcel } from '@/domain/ord/parcel/entity/parcel.entity';
import { XPushService } from '@/domain/external/xpush/x-push.service';

export class ClearedTrackingListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    private xPushService: XPushService,
    private trackingHandlerService: TrackingHandlerService,
    private trackingService: TrackingService,
    private myKafkaService: MyKafkaService,
  ) {}

  onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('CLEARED_PARCEL_TOPIC', this);
    Logger.log('CLEARED_PARCEL_TOPIC subscribe success');
  }

  @SubscribeTo('CLEARED_PARCEL_TOPIC')
  async clearedTrackingConsumer(@Payload() data: any) {
    const tracking: ClearedParcelDto = JSON.parse(data);
    const trackingSet = {
      trackingNumber: tracking.trackingNumber,
      timestamp: tracking.clearedAt,
      event: tracking.event,
      location: tracking.location,
      description: '',
    } as Tracking;
    try {
      const trackingEvent = await this.trackingHandlerService.handleTrackingEventList([trackingSet], '');
      trackingSet.description = trackingEvent[0].fr;
      await this.trackingService.bulkInsert([trackingSet]);
      const parcel = await getRepository(Parcel).findOne({
        where: { trackingNumber: tracking.trackingNumber },
        select: ['trackingNumber', 'transporter'],
      });
      if (parcel?.transporter !== 'CMS_TRACK') {
        await this.myKafkaService.kafkaEnqueue('handle-tracking-new', {
          trackingNumbers: [trackingSet.trackingNumber],
        });
      }
    } catch (e) {
      this.xPushService
        .sendDingDing(`清关完成${trackingSet.trackingNumber}插入轨迹异常 ${e.message}`, 'tracking')
        .then();
    }
  }
}
