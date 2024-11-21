import { HttpModule, Module } from '@nestjs/common';
import { SmService } from '@/domain/external/scheduler/sm.service';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '@/domain/external/message/email.service';
import { XPushService } from '@/domain/external/xpush/x-push.service';
import { RedisCacheNewService } from './cache/redisCacheNew.service';
import { CacheSubscribe } from '@/domain/external/cache/cache.subscribe';
import { SmsService } from '@/domain/external/sms/sms.service';
import { MagicBIService } from '@/domain/external/magicBI/magicBI.service';
import { NacosModule } from '@/domain/external/nacos/nacos.module';
import { NacosService } from '@/domain/external/nacos/nacos.service';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    SmService,
    EmailService,
    XPushService,
    RedisCacheNewService,
    CacheSubscribe,
    SmsService,
    MagicBIService,
    NacosService,
    NacosRepository,
  ],
  exports: [
    SmService,
    EmailService,
    XPushService,
    RedisCacheNewService,
    CacheSubscribe,
    SmsService,
    MagicBIService,
    NacosService,
    NacosRepository,
  ],
})
export class ExternalModule {}
