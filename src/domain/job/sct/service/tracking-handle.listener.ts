import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, SubscribeTo } from '@rob3000/nestjs-kafka';
import { Payload } from '@nestjs/microservices';
import { KafkaMessage } from 'kafkajs';
import _ from 'lodash';
import { TrackingHandlerNewService } from '@/domain/sct/core/service/tracking-handler-new.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';

/**
 * 处理新增轨迹的包裹 更新包裹状态
 */
@Injectable()
export class TrackingHandleListener implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private kafkaClient: KafkaService,
    private readonly trackingHandlerNewService: TrackingHandlerNewService,
    private xPushService: XPushService,
  ) {}

  onModuleInit(): void {
    this.kafkaClient.subscribeToResponseOf('handle-tracking-new', this);
    Logger.log('handle-tracking subscribe success');
  }

  @SubscribeTo('handle-tracking-new')
  async trackingHandleConsumerNew(@Payload() data: KafkaMessage) {
    try {
      const body = JSON.parse(data + '').body;
      const trackingNumbers = body.trackingNumbers;
      if (_.isEmpty(trackingNumbers)) {
        return;
      }
      await this.trackingHandlerNewService.handleTracking(trackingNumbers);
    } catch (e) {
      console.error(e);
      return;
    }
  }
}
