import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          db: configService.get('REDIS_DB'),
          password: configService.get('REDIS_PASSWORD'),
          tls: process.env.REDIS_TLS
            ? {
                checkServerIdentity: () => undefined,
              }
            : null,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MyBullModule {}
