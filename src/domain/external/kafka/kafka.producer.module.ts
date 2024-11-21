import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { KafkaProducer } from '@/domain/external/kafka/kafka.producer';

@Module({
  imports: [ConfigModule],
  providers: [KafkaProducer, XPushService],
  exports: [KafkaProducer],
})
export class KafkaProducerModule {}
