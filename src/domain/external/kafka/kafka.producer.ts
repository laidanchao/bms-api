import { Kafka, Producer } from 'kafkajs';
import { BusinessException } from '@/app/exception/business-exception';
import { XPushService } from '../xpush/x-push.service';

export class KafkaProducer {
  constructor(private xPushService: XPushService) {}

  private producer: Producer;

  private async init() {
    if (!this.producer) {
      const kafka = new Kafka({
        brokers: process.env.KAFKA_BROKERS.split(','),
        connectionTimeout: 5000,
        retry: {
          retries: 3,
        },
      });
      this.producer = kafka.producer();
      await this.producer.connect();
    }
  }

  async sendKafka(topic: string, body: any) {
    try {
      await this.init();
      const result = await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify({ topic, body }),
          },
        ],
      });
      return result;
    } catch (e) {
      this.xPushService.sendDingDing(JSON.stringify(e), 'it_robot').then();
      throw new BusinessException(e);
    }
  }
}
