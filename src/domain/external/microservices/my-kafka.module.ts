import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/app/config/configuration';
import { logLevel } from '@nestjs/microservices/external/kafka.interface';
import { KafkaModule } from '@rob3000/nestjs-kafka';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      // 这个哪怕文件不存在, 程序也不会报错. 目的是本地启动各种环境变量.
      envFilePath: `${process.env.NODE_ENV}.env`,
    }),
    KafkaModule.register([
      {
        name: 'KAFKA_SERVICE',
        options: {
          client: {
            clientId: 'CMS-API-3',
            brokers: process.env.KAFKA_BROKERS.split(','),
            logLevel: logLevel.ERROR,
            connectionTimeout: 30000,
            requestTimeout: 30000,
          },
          consumer: {
            groupId: process.env.NODE_ENV.includes('production') ? 'CMS-NEST-API' : 'CMS-NEST-API-3',
            retry: {
              retries: 2,
            },
            // ERROR [Connection] Response Heartbeat(key: 12, version: 2) {"timestamp":"2021-09-23T03:26:31.611Z","logger":"kafkajs","broker":"b-2.kafka-center-prod.dijqq6.c4.kafka.eu-west-1.amazonaws.com:9092","clientId":"kafkaClient","error":"The coordinator is not aware of this member","correlationId":201,"size":10}
            // https://github.com/tulios/kafkajs/issues/130
            sessionTimeout: 180000,
            maxBytesPerPartition: 1024 * 1000 * 0.1,
            maxBytes: 1024 * 1000 * 0.5,
          },
          consumeFromBeginning: true,
          autoConnect: true,
        },
      },
    ]),
  ],
})
export class MyKafkaModule {}
