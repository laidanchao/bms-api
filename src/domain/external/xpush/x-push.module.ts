import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { XPushService } from '@/domain/external/xpush/x-push.service';

@Module({
  imports: [ConfigModule],
  providers: [XPushService],
  exports: [XPushService],
})
export class XPushModule {}
