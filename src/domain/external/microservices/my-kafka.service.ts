import { Inject, Injectable } from '@nestjs/common';
import { KafkaService } from '@rob3000/nestjs-kafka';
import { BusinessException } from '@/app/exception/business-exception';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Injectable()
export class MyKafkaService {
  constructor(@Inject('KAFKA_SERVICE') private kafkaClient: KafkaService, private xPushService: XPushService) {}

  /**
   * kafka推送
   * @param topic
   * @param body
   * @param kafkaKey
   */
  async kafkaEnqueue(topic, body, kafkaKey = null) {
    const result = await this.kafkaClient
      .send({
        topic,
        messages: [
          {
            key: kafkaKey,
            value: JSON.stringify({ topic, body }),
          },
        ],
      })
      .catch(e => {
        this.xPushService.sendDingDing(JSON.stringify(e), 'it_robot' );
        throw new BusinessException(e);
      });
    return result;
  }
}
