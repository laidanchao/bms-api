import { Module } from '@nestjs/common';
import { NacosService } from '@/domain/external/nacos/nacos.service';
import { NacosRepository } from '@/domain/external/nacos/nacos.repository';
import { ConfigModule } from '@nestjs/config';
import { XPushModule } from '@/domain/external/xpush/x-push.module';

@Module({
  imports: [ConfigModule, XPushModule],
  providers: [NacosService, NacosRepository],
  exports: [NacosService, NacosRepository],
})
export class NacosModule {}
