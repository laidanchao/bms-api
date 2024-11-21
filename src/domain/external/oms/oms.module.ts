import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OmsService } from '@/domain/external/oms/oms.service';

@Module({
  imports: [ConfigModule],
  providers: [OmsService],
  exports: [OmsService],
})
export class OmsModule {}
